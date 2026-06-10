import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FloorplanBadge,
  FloorplanCanvas,
  FloorplanImage,
  FloorplanRoot,
  FloorplanStage,
  FloorplanState,
  FloorplanSvg,
} from './FloorplanRouteView.styles'

const MIN_SCALE_FALLBACK = 0.35
const MAX_SCALE = 5
const ROUTE_FIT_PADDING = 1.1
const DEFAULT_ROUTE_ZOOM = 2

export default function FloorplanRouteView({
  floorplan,
  mapLeg,
  activeStep = null,
  showInstructionBadge = true,
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
  const [cameraState, setCameraState] = useState({
    floorKey: null,
    camera: null,
    userMoved: false,
    preferredScale: null,
  })
  const viewModel = useMemo(
    () => normalizeFloorplanViewModel(floorplan, mapLeg, activeStep),
    [activeStep, floorplan, mapLeg],
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
  const activeStepIsArrival = isArrivalStep(activeStep)
  const imageSize =
    imageState.src === viewModel.mapImageUrl && !imageState.hasError
      ? imageState.size
      : null
  const hasImageError =
    imageState.src === viewModel.mapImageUrl && imageState.hasError
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
      imageSize && stageSize && baseCamera && !activeStepIsArrival
        ? resolveActiveCamera({
            activePoint: viewModel.activeMarker,
            baseCamera,
            camera,
            imageSize,
            stageSize,
            userMovedCamera,
          })
        : null,
    [
      activeStepIsArrival,
      baseCamera,
      camera,
      imageSize,
      stageSize,
      userMovedCamera,
      viewModel.activeMarker,
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
    if (!baseCamera || userMovedCamera || activeStepIsArrival) {
      return
    }

    return animateCamera(setCamera, baseCamera)
  }, [activeStepIsArrival, baseCamera, setCamera, userMovedCamera])

  useEffect(() => {
    if (!activeCamera || isInteractingRef.current) {
      return
    }

    return animateCamera(setCamera, activeCamera)
  }, [activeCamera, setCamera])

  if (!viewModel.mapImageUrl) {
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
              <image
                href={viewModel.mapImageUrl}
                x="0"
                y="0"
                width={imageSize.width}
                height={imageSize.height}
                preserveAspectRatio="none"
              />
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
                    fill="rgba(37, 99, 235, 0.2)"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={viewModel.activeMarker.x}
                    cy={viewModel.activeMarker.y}
                    r="9"
                    fill="var(--blue-700)"
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

function normalizeFloorplanViewModel(floorplan, mapLeg, activeStep) {
  if (floorplan) {
    const mapLegs = Array.isArray(floorplan.mapLegs) ? floorplan.mapLegs : []
    const activeMarker = findActiveMarker(mapLegs, activeStep)

    return {
      key: floorplan.key ?? floorplan.id ?? floorplan.name ?? floorplan.mapImageUrl,
      mapImageUrl: floorplan.mapImageUrl,
      floorName: floorplan.name,
      routePoints: mapLegs.flatMap((leg) => toValidMapPoints(leg.path)),
      polylines: mapLegs
        .map((leg, index) => ({
          id: leg.id ?? `${floorplan.key}-path-${index}`,
          points: toPolylinePoints(leg.path),
        }))
        .filter((polyline) => polyline.points),
      activeMarker,
      activeInstruction:
        activeStep?.instruction ?? floorplan.steps?.[0]?.instruction ?? null,
    }
  }

  const activeMarker = findActiveMarker(mapLeg ? [mapLeg] : [], activeStep)

  return {
    key: mapLeg?.id ?? mapLeg?.mapImageUrl ?? 'floorplan',
    mapImageUrl: mapLeg?.mapImageUrl,
    floorName: mapLeg?.floorName,
    routePoints: toValidMapPoints(mapLeg?.path),
    polylines: [
      {
        id: mapLeg?.id ?? 'path',
        points: toPolylinePoints(mapLeg?.path),
      },
    ].filter((polyline) => polyline.points),
    activeMarker,
    activeInstruction: activeStep?.instruction ?? mapLeg?.steps?.[0]?.instruction ?? null,
  }
}

function resolveBaseCamera(viewModel, imageSize, stageSize, preferredScale = null) {
  const containScale = Math.min(
    stageSize.width / imageSize.width,
    stageSize.height / imageSize.height,
  )
  const routeBounds = getPointBounds(viewModel.routePoints)
  const routeScale = routeBounds
    ? resolveRouteFitScale(routeBounds, stageSize)
    : containScale
  const routeZoomScale = Math.max(
    containScale,
    Math.min(routeScale, containScale * DEFAULT_ROUTE_ZOOM),
  )
  const scale = clamp(
    preferredScale ?? routeZoomScale,
    getMinScale(imageSize, stageSize),
    MAX_SCALE,
  )
  const center = getBoundsCenter(routeBounds) ?? {
    x: imageSize.width / 2,
    y: imageSize.height / 2,
  }

  return clampCamera(centerCamera(center, scale, stageSize), imageSize, stageSize)
}

function resolveActiveCamera({
  activePoint,
  baseCamera,
  camera,
  imageSize,
  stageSize,
  userMovedCamera,
}) {
  if (!activePoint) {
    return userMovedCamera ? null : baseCamera
  }

  const scale = camera?.scale ?? baseCamera.scale
  return clampCamera(centerCamera(activePoint, scale, stageSize), imageSize, stageSize)
}

function resolveRouteFitScale(bounds, stageSize) {
  const routeWidth = Math.max(bounds.maxX - bounds.minX, 1)
  const routeHeight = Math.max(bounds.maxY - bounds.minY, 1)

  return Math.min(
    stageSize.width / (routeWidth * ROUTE_FIT_PADDING),
    stageSize.height / (routeHeight * ROUTE_FIT_PADDING),
  )
}

function getMinScale(imageSize, stageSize) {
  if (!imageSize || !stageSize) {
    return MIN_SCALE_FALLBACK
  }

  return Math.min(
    stageSize.width / imageSize.width,
    stageSize.height / imageSize.height,
  )
}

function centerCamera(point, scale, stageSize) {
  return {
    scale,
    x: stageSize.width / 2 - point.x * scale,
    y: stageSize.height / 2 - point.y * scale,
  }
}

function clampCamera(camera, imageSize, stageSize) {
  const scaledWidth = imageSize.width * camera.scale
  const scaledHeight = imageSize.height * camera.scale

  return {
    scale: camera.scale,
    x: clampTranslation(camera.x, scaledWidth, stageSize.width),
    y: clampTranslation(camera.y, scaledHeight, stageSize.height),
  }
}

function clampTranslation(value, scaledSize, viewportSize) {
  if (scaledSize <= viewportSize) {
    return (viewportSize - scaledSize) / 2
  }

  return clamp(value, viewportSize - scaledSize, 0)
}

function screenToImagePoint(point, camera) {
  return {
    x: (point.x - camera.x) / camera.scale,
    y: (point.y - camera.y) / camera.scale,
  }
}

function scheduleCameraUpdate(nextCamera, setCamera, pendingCameraRef, frameRef) {
  pendingCameraRef.current = nextCamera

  if (frameRef.current) {
    return
  }

  frameRef.current = requestAnimationFrame(() => {
    frameRef.current = null
    if (pendingCameraRef.current) {
      setCamera(pendingCameraRef.current)
      pendingCameraRef.current = null
    }
  })
}

function getPointerPair(pointerMap) {
  return [...pointerMap.values()].slice(0, 2)
}

function getPointerCenter(pointers) {
  return {
    x: (pointers[0].x + pointers[1].x) / 2,
    y: (pointers[0].y + pointers[1].y) / 2,
  }
}

function getPointerDistance(pointers) {
  const dx = pointers[0].x - pointers[1].x
  const dy = pointers[0].y - pointers[1].y
  return Math.sqrt(dx * dx + dy * dy)
}

function animateCamera(setCamera, targetCamera) {
  let frameId = null
  const durationMs = 220

  setCamera((currentCamera) => {
    if (!currentCamera) {
      return targetCamera
    }

    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / durationMs, 1)
      const eased = easeOutCubic(progress)

      setCamera({
        x: interpolate(currentCamera.x, targetCamera.x, eased),
        y: interpolate(currentCamera.y, targetCamera.y, eased),
        scale: interpolate(currentCamera.scale, targetCamera.scale, eased),
      })

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return currentCamera
  })

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }
  }
}

function interpolate(from, to, progress) {
  return from + (to - from) * progress
}

function easeOutCubic(value) {
  return 1 - ((1 - value) ** 3)
}

function findActiveMarker(mapLegs, activeStep) {
  if (!activeStep || isArrivalStep(activeStep)) {
    return null
  }

  const leg = mapLegs.find((item) =>
    [item?.id, item?.segmentId, item?.mapLegId]
      .filter(Boolean)
      .includes(activeStep.segmentId ?? activeStep.mapLegId),
  )

  if (!leg || !Array.isArray(leg.path) || leg.path.length === 0) {
    return null
  }

  const startIndex = Number.isInteger(activeStep.pathStartIndex)
    ? activeStep.pathStartIndex
    : activeStep.pathIndex
  const point = leg.path[Math.max(Math.min(startIndex ?? 0, leg.path.length - 1), 0)]

  if (!isValidMapPoint(point)) {
    return null
  }

  return {
    id: `${activeStep.id ?? leg.id}-active-marker`,
    x: point.x,
    y: point.y,
  }
}

function isArrivalStep(step = {}) {
  return String(step.instruction ?? '').includes('도착')
}

function toPolylinePoints(path) {
  const points = toValidMapPoints(path)

  if (points.length < 2) {
    return null
  }

  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

function getPointBounds(points) {
  const validPoints = Array.isArray(points) ? points.filter(isValidMapPoint) : []
  if (validPoints.length === 0) {
    return null
  }

  return validPoints.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: validPoints[0].x,
      minY: validPoints[0].y,
      maxX: validPoints[0].x,
      maxY: validPoints[0].y,
    },
  )
}

function getBoundsCenter(bounds) {
  if (!bounds) {
    return null
  }

  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  }
}

function toValidMapPoints(path) {
  return Array.isArray(path) ? path.filter(isValidMapPoint) : []
}

function isValidMapPoint(point) {
  return typeof point?.x === 'number' && typeof point?.y === 'number'
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
