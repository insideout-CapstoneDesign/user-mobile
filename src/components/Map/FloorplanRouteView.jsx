import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchPublishedFloorMap } from '../../apis/mapApi'
import FloorplanVectorLayers from './floorplan/FloorplanVectorLayers'
import {
  MAX_SCALE,
  animateCamera,
  clampCamera,
  getMinScale,
  getPointerCenter,
  getPointerDistance,
  getPointerPair,
  resolveActiveCamera,
  resolveBaseCamera,
  scheduleCameraUpdate,
  screenToImagePoint,
} from './floorplan/floorplanCamera'
import { clamp } from './floorplan/floorplanGeometry'
import { normalizeFloorplanViewModel } from './floorplan/floorplanRouteViewModel'
import {
  FloorplanBadge,
  FloorplanCanvas,
  FloorplanImage,
  FloorplanRoot,
  FloorplanStage,
  FloorplanState,
  FloorplanSvg,
} from './FloorplanRouteView.styles'

const DEFAULT_IMAGE_FALLBACK_DELAY_MS = 600

function resolveImageFallbackDelayMs(value) {
  const number = Number.parseInt(value, 10)
  return Number.isInteger(number) && number >= 0
    ? number
    : DEFAULT_IMAGE_FALLBACK_DELAY_MS
}

export default function FloorplanRouteView({
  floorplan,
  mapLeg,
  activeStep = null,
  showInstructionBadge = true,
  imageFallbackDelayMs = resolveImageFallbackDelayMs(
    import.meta.env.VITE_IMAGE_FALLBACK_DELAY_MS,
  ),
}) {
  const stageRef = useRef(null)
  const isInteractingRef = useRef(false)
  const activePointersRef = useRef(new Map())
  const gestureStartRef = useRef(null)
  const cameraFrameRef = useRef(null)
  const pendingCameraRef = useRef(null)
  const [stageSize, setStageSize] = useState(null)
  const [imageState, setImageState] = useState({
    src: null,
    size: null,
    hasError: false,
  })
  const [publishedMapState, setPublishedMapState] = useState({
    floorId: null,
    data: null,
  })
  const [imageFallbackDelayState, setImageFallbackDelayState] = useState({
    floorId: null,
  })
  const [cameraState, setCameraState] = useState({
    floorKey: null,
    camera: null,
    userMoved: false,
    preferredScale: null,
  })
  const currentFloorId = floorplan?.id ?? mapLeg?.floorId ?? null
  const publishedMapData =
    publishedMapState.floorId === currentFloorId ? publishedMapState.data : null
  const viewModel = useMemo(
    () =>
      normalizeFloorplanViewModel(
        floorplan,
        mapLeg,
        activeStep,
        publishedMapData,
      ),
    [activeStep, floorplan, mapLeg, publishedMapData],
  )
  const isSameFloor = cameraState.floorKey === viewModel.key
  const camera = isSameFloor ? cameraState.camera : null
  const userMovedCamera = isSameFloor ? cameraState.userMoved : false
  const preferredScale = cameraState.preferredScale
  const setCamera = useCallback((nextCameraOrUpdater) => {
    setCameraState((currentState) => {
      const currentCamera =
        currentState.floorKey === viewModel.key ? currentState.camera : null
      const nextCamera =
        typeof nextCameraOrUpdater === 'function'
          ? nextCameraOrUpdater(currentCamera)
          : nextCameraOrUpdater

      return {
        floorKey: viewModel.key,
        camera: nextCamera,
        userMoved:
          currentState.floorKey === viewModel.key
            ? currentState.userMoved
            : false,
        preferredScale: nextCamera?.scale ?? currentState.preferredScale,
      }
    })
  }, [viewModel.key])
  const markUserMovedCamera = useCallback(() => {
    setCameraState((currentState) => ({
      floorKey: viewModel.key,
      camera: currentState.floorKey === viewModel.key ? currentState.camera : null,
      userMoved: true,
      preferredScale: currentState.preferredScale,
    }))
  }, [viewModel.key])
  const vectorSize = viewModel.vectorMap?.size ?? null
  const isPublishedMapSettled =
    !currentFloorId || publishedMapState.floorId === currentFloorId
  const imageFallbackDelayElapsed =
    imageFallbackDelayState.floorId === currentFloorId
  const allowImageFallback =
    !currentFloorId ||
    imageFallbackDelayElapsed ||
    (isPublishedMapSettled && !vectorSize)
  const imageSize =
    vectorSize ??
    (allowImageFallback &&
    imageState.src === viewModel.mapImageUrl &&
    !imageState.hasError
      ? imageState.size
      : null)
  const hasImageError =
    allowImageFallback &&
    !vectorSize &&
    imageState.src === viewModel.mapImageUrl &&
    imageState.hasError
  const baseCamera = useMemo(
    () =>
      imageSize && stageSize
        ? resolveBaseCamera(
            viewModel,
            imageSize,
            stageSize,
            preferredScale,
          )
        : null,
    [imageSize, preferredScale, stageSize, viewModel],
  )
  const activeCamera = useMemo(
    () =>
      imageSize && stageSize && baseCamera
        ? resolveActiveCamera({
            activePoint: viewModel.activeFocusPoint,
            baseCamera,
            camera,
            imageSize,
            stageSize,
            userMovedCamera,
          })
        : null,
    [
      baseCamera,
      camera,
      imageSize,
      stageSize,
      userMovedCamera,
      viewModel.activeFocusPoint,
    ],
  )
  const transform = camera ?? baseCamera

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) {
      return undefined
    }

    const updateStageSize = () => {
      setStageSize({
        width: stage.clientWidth,
        height: stage.clientHeight,
      })
    }

    updateStageSize()

    const observer = new ResizeObserver(updateStageSize)
    observer.observe(stage)

    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (cameraFrameRef.current) {
      cancelAnimationFrame(cameraFrameRef.current)
    }
  }, [])

  useEffect(() => {
    const floorId = currentFloorId

    if (!floorId) {
      return undefined
    }

    let isActive = true

    fetchPublishedFloorMap(floorId)
      .then((data) => {
        if (!isActive) return
        setPublishedMapState({ floorId, data })
      })
      .catch(() => {
        if (!isActive) return
        setPublishedMapState({ floorId, data: null })
      })

    return () => {
      isActive = false
    }
  }, [currentFloorId])

  useEffect(() => {
    if (!currentFloorId) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setImageFallbackDelayState({ floorId: currentFloorId })
    }, resolveImageFallbackDelayMs(imageFallbackDelayMs))

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentFloorId, imageFallbackDelayMs])

  useEffect(() => {
    if (!baseCamera || userMovedCamera || viewModel.activeFocusPoint) {
      return
    }

    return animateCamera(setCamera, baseCamera)
  }, [baseCamera, setCamera, userMovedCamera, viewModel.activeFocusPoint])

  useEffect(() => {
    if (!activeCamera || isInteractingRef.current) {
      return
    }

    return animateCamera(setCamera, activeCamera)
  }, [activeCamera, setCamera])

  if (!viewModel.hasRenderableMap) {
    return (
      <FloorplanRoot>
        <FloorplanState>도면을 불러올 수 없습니다.</FloorplanState>
      </FloorplanRoot>
    )
  }

  return (
    <FloorplanRoot>
      <FloorplanStage
        ref={stageRef}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (!transform) return
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          isInteractingRef.current = true
          const rect = event.currentTarget.getBoundingClientRect()
          activePointersRef.current.set(event.pointerId, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          })
          markUserMovedCamera()

          if (activePointersRef.current.size >= 2) {
            const pointers = getPointerPair(activePointersRef.current)
            const center = getPointerCenter(pointers)
            gestureStartRef.current = {
              camera: transform,
              center,
              distance: getPointerDistance(pointers),
              imageFocus: screenToImagePoint(center, transform),
            }
            return
          }

          gestureStartRef.current = {
            camera: transform,
            dragStart: {
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            },
          }
        }}
        onPointerMove={(event) => {
          if (!isInteractingRef.current || !imageSize || !stageSize) return
          event.preventDefault()
          const rect = event.currentTarget.getBoundingClientRect()
          activePointersRef.current.set(event.pointerId, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          })

          if (activePointersRef.current.size >= 2 && gestureStartRef.current?.imageFocus) {
            const pointers = getPointerPair(activePointersRef.current)
            const center = getPointerCenter(pointers)
            const distance = getPointerDistance(pointers)
            const startDistance = Math.max(gestureStartRef.current.distance, 1)
            const minScale = getMinScale(imageSize, stageSize)
            const nextScale = clamp(
              gestureStartRef.current.camera.scale * (distance / startDistance),
              minScale,
              MAX_SCALE,
            )
            const nextCamera = clampCamera(
              {
                scale: nextScale,
                x: center.x - gestureStartRef.current.imageFocus.x * nextScale,
                y: center.y - gestureStartRef.current.imageFocus.y * nextScale,
              },
              imageSize,
              stageSize,
            )

            scheduleCameraUpdate(nextCamera, setCamera, pendingCameraRef, cameraFrameRef)
            return
          }

          if (gestureStartRef.current?.dragStart) {
            const { camera: startCamera, dragStart } = gestureStartRef.current
            const nextCamera = clampCamera(
              {
                ...startCamera,
                x: startCamera.x + event.clientX - rect.left - dragStart.x,
                y: startCamera.y + event.clientY - rect.top - dragStart.y,
              },
              imageSize,
              stageSize,
            )

            scheduleCameraUpdate(nextCamera, setCamera, pendingCameraRef, cameraFrameRef)
          }
        }}
        onPointerUp={(event) => {
          event.preventDefault()
          activePointersRef.current.delete(event.pointerId)
          isInteractingRef.current = activePointersRef.current.size > 0
          if (activePointersRef.current.size === 1 && camera) {
            const remainingPointer = [...activePointersRef.current.values()][0]
            gestureStartRef.current = {
              camera,
              dragStart: remainingPointer,
            }
          } else if (activePointersRef.current.size === 0) {
            gestureStartRef.current = null
          }
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={(event) => {
          event.preventDefault()
          activePointersRef.current.delete(event.pointerId)
          isInteractingRef.current = activePointersRef.current.size > 0
          if (!isInteractingRef.current) {
            gestureStartRef.current = null
          }
        }}
        onWheel={(event) => {
          if (!transform || !imageSize || !stageSize) return
          event.preventDefault()
          markUserMovedCamera()

          const rect = event.currentTarget.getBoundingClientRect()
          const focus = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          }
          const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
          const nextScale = clamp(
            transform.scale * scaleFactor,
            getMinScale(imageSize, stageSize),
            MAX_SCALE,
          )
          const imageFocus = screenToImagePoint(focus, transform)
          const nextCamera = clampCamera(
            {
              scale: nextScale,
              x: focus.x - imageFocus.x * nextScale,
              y: focus.y - imageFocus.y * nextScale,
            },
            imageSize,
            stageSize,
          )

          setCamera(nextCamera)
        }}
      >
        <FloorplanCanvas>
          {!vectorSize && allowImageFallback && viewModel.mapImageUrl ? (
            <FloorplanImage
              key={viewModel.mapImageUrl}
              src={viewModel.mapImageUrl}
              alt={viewModel.floorName ? `${viewModel.floorName} 도면` : '도면'}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              onLoad={(event) => {
                setImageState({
                  src: viewModel.mapImageUrl,
                  hasError: false,
                  size: {
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  },
                })
              }}
              onError={() =>
                setImageState({
                  src: viewModel.mapImageUrl,
                  size: null,
                  hasError: true,
                })
              }
            />
          ) : null}

          {imageSize && transform ? (
            <FloorplanSvg
              viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              draggable="false"
              onDragStart={(event) => event.preventDefault()}
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                transformOrigin: '0 0',
              }}
            >
              {viewModel.vectorMap ? (
                <FloorplanVectorLayers vectorMap={viewModel.vectorMap} />
              ) : (
                <image
                  href={viewModel.mapImageUrl}
                  x="0"
                  y="0"
                  width={imageSize.width}
                  height={imageSize.height}
                  preserveAspectRatio="none"
                />
              )}
              {viewModel.polylines.map((polyline) => (
                <g key={polyline.id}>
                  <polyline
                    points={polyline.points}
                    fill="none"
                    stroke="rgba(37, 99, 235, 0.24)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points={polyline.points}
                    fill="none"
                    stroke="var(--blue-600)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
              {viewModel.activeMarker ? (
                <g>
                  <circle
                    cx={viewModel.activeMarker.x}
                    cy={viewModel.activeMarker.y}
                    r="17"
                    fill={viewModel.activeMarker.backgroundColor}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={viewModel.activeMarker.x}
                    cy={viewModel.activeMarker.y}
                    r="9"
                    fill={viewModel.activeMarker.color}
                    stroke="var(--surface-0)"
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ) : null}
            </FloorplanSvg>
          ) : null}
        </FloorplanCanvas>
      </FloorplanStage>

      {showInstructionBadge && viewModel.activeInstruction ? (
        <FloorplanBadge>{viewModel.activeInstruction}</FloorplanBadge>
      ) : null}

      {hasImageError ? (
        <FloorplanState>도면 이미지가 만료되었거나 불러올 수 없습니다.</FloorplanState>
      ) : null}
    </FloorplanRoot>
  )
}
