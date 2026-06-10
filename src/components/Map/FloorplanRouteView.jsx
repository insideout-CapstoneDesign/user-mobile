import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchPublishedFloorMap } from '../../apis/mapApi'
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
const ROUTE_FIT_PADDING = 0.9
const DEFAULT_ROUTE_ZOOM = 3.2
const DESTINATION_POI_SNAP_RADIUS_PX = 180
const IMAGE_FALLBACK_DELAY_MS = 600

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
  const [publishedMapState, setPublishedMapState] = useState({
    floorId: null,
    data: null,
    hasError: false,
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
        setPublishedMapState({ floorId, data, hasError: false })
      })
      .catch(() => {
        if (!isActive) return
        setPublishedMapState({ floorId, data: null, hasError: true })
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
    }, IMAGE_FALLBACK_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentFloorId])

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
                <VectorFloorplanLayers vectorMap={viewModel.vectorMap} />
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

function normalizeFloorplanViewModel(floorplan, mapLeg, activeStep, publishedMap) {
  const vectorMap = normalizePublishedMap(publishedMap)

  if (floorplan) {
    const mapLegs = Array.isArray(floorplan.mapLegs) ? floorplan.mapLegs : []
    const displayMapLegs = extendLastLegToDestinationPoi(mapLegs, vectorMap?.pois)
    const activeMarker = findActiveMarker(displayMapLegs, activeStep)
    const activeFocusPoint = findActiveFocusPoint(displayMapLegs, activeStep)

    return {
      key: floorplan.key ?? floorplan.id ?? floorplan.name ?? floorplan.mapImageUrl,
      mapImageUrl: vectorMap?.imageUrl ?? floorplan.mapImageUrl,
      hasRenderableMap: Boolean(vectorMap || floorplan.mapImageUrl),
      vectorMap,
      floorName: floorplan.name,
      activeFocusPoint,
      routePoints: displayMapLegs.flatMap((leg) => toValidMapPoints(leg.path)),
      polylines: displayMapLegs
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

  const displayMapLegs = extendLastLegToDestinationPoi(
    mapLeg ? [mapLeg] : [],
    vectorMap?.pois,
  )
  const displayMapLeg = displayMapLegs[0] ?? mapLeg
  const activeMarker = findActiveMarker(displayMapLegs, activeStep)
  const activeFocusPoint = findActiveFocusPoint(displayMapLegs, activeStep)

  return {
    key: displayMapLeg?.id ?? displayMapLeg?.mapImageUrl ?? 'floorplan',
    mapImageUrl: vectorMap?.imageUrl ?? displayMapLeg?.mapImageUrl,
    hasRenderableMap: Boolean(vectorMap || displayMapLeg?.mapImageUrl),
    vectorMap,
    floorName: displayMapLeg?.floorName,
    activeFocusPoint,
    routePoints: toValidMapPoints(displayMapLeg?.path),
    polylines: [
      {
        id: displayMapLeg?.id ?? 'path',
        points: toPolylinePoints(displayMapLeg?.path),
      },
    ].filter((polyline) => polyline.points),
    activeMarker,
    activeInstruction:
      activeStep?.instruction ?? displayMapLeg?.steps?.[0]?.instruction ?? null,
  }
}

function VectorFloorplanLayers({ vectorMap }) {
  return (
    <g>
      <rect
        x="0"
        y="0"
        width={vectorMap.size.width}
        height={vectorMap.size.height}
        fill="#f8fafc"
      />
      {vectorMap.zones.map((zone) => (
        <path
          key={zone.id}
          d={zone.path}
          fill={zone.fill}
          stroke={zone.stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {vectorMap.objects.map((object) => (
        <path
          key={object.id}
          d={object.path}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {vectorMap.pois.map((poi) => (
        <PoiLabel key={poi.id} poi={poi} />
      ))}
    </g>
  )
}

function PoiLabel({ poi }) {
  if (!poi.name || poi.lines.length === 0) {
    return null
  }

  const lineHeight = poi.fontSize * 1.18
  const firstDy = -((poi.lines.length - 1) * lineHeight) / 2

  return (
    <text
      x={poi.x}
      y={poi.y}
      fill="#111827"
      fontSize={poi.fontSize}
      fontWeight="800"
      textAnchor="middle"
      dominantBaseline="middle"
      paintOrder="stroke"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinejoin="round"
    >
      {poi.lines.map((line, index) => (
        <tspan
          key={`${poi.id}-line-${index}`}
          x={poi.x}
          dy={index === 0 ? firstDy : lineHeight}
        >
          {line}
        </tspan>
      ))}
    </text>
  )
}

function normalizePublishedMap(mapData) {
  if (!mapData) {
    return null
  }

  const width = toPositiveNumber(mapData.floorplanWidthPx)
  const height = toPositiveNumber(mapData.floorplanHeightPx)

  if (!width || !height) {
    return null
  }

  return {
    imageUrl: mapData.floorplanImageUrl ?? null,
    size: { width, height },
    zones: normalizeZones(mapData.zones),
    objects: normalizeFloorplanObjects(mapData.floorplanObjects),
    pois: normalizePois(mapData.pois),
  }
}

function normalizeZones(zones) {
  if (!Array.isArray(zones)) {
    return []
  }

  return zones
    .map((zone, index) => {
      const path = geoJsonToPath(zone?.geomPx)
      if (!path) return null

      return {
        id: zone.id ?? `zone-${index}`,
        path,
        fill: zone?.properties?.fill ?? 'rgba(219, 234, 254, 0.52)',
        stroke: zone?.properties?.stroke ?? 'rgba(96, 165, 250, 0.55)',
      }
    })
    .filter(Boolean)
}

function normalizeFloorplanObjects(objects) {
  if (!Array.isArray(objects)) {
    return []
  }

  return objects
    .map((object, index) => {
      const path = geoJsonToPath(object?.geomPx)
      if (!path) return null

      const kind = String(object?.kind ?? '').toLowerCase()
      const isArea = getGeometryType(object?.geomPx) === 'Polygon'

      return {
        id: object.id ?? `object-${index}`,
        path,
        fill: isArea ? 'rgba(15, 23, 42, 0.08)' : 'none',
        stroke: kind.includes('wall') ? '#334155' : '#64748b',
        strokeWidth: kind.includes('wall') ? 3 : 2,
      }
    })
    .filter(Boolean)
}

function normalizePois(pois) {
  if (!Array.isArray(pois)) {
    return []
  }

  return pois
    .map((poi, index) => {
      const point = geoJsonToPoint(poi?.geomPx)
      if (!point) return null
      const labelBox = getGeometryBounds(poi?.footprintPx)
      const label = buildPoiLabel(poi.name, labelBox)

      return {
        id: poi.id ?? `poi-${index}`,
        name: poi.name ?? '',
        x: labelBox?.center.x ?? point.x,
        y: labelBox?.center.y ?? point.y,
        lines: label.lines,
        fontSize: label.fontSize,
      }
    })
    .filter(Boolean)
}

function buildPoiLabel(name, bounds) {
  const cleanName = String(name ?? '').trim()
  if (!cleanName) {
    return { lines: [], fontSize: 14 }
  }

  const maxWidth = Math.max((bounds?.width ?? 96) - 12, 42)
  const maxHeight = Math.max((bounds?.height ?? 42) - 8, 22)
  const wordLines = cleanName.includes(' ')
    ? cleanName.split(/\s+/).filter(Boolean)
    : [cleanName]

  const candidateLines = compactPoiLabelLines(wordLines, maxWidth, 18)
  const fontSize = resolvePoiLabelFontSize(candidateLines, maxWidth, maxHeight)

  return {
    lines: compactPoiLabelLines(wordLines, maxWidth, fontSize),
    fontSize,
  }
}

function compactPoiLabelLines(words, maxWidth, fontSize) {
  if (words.length <= 1) {
    return words
  }

  const lines = []

  words.forEach((word) => {
    const lastLine = lines[lines.length - 1]
    const candidate = lastLine ? `${lastLine} ${word}` : word

    if (lastLine && estimateTextWidth(candidate, fontSize) <= maxWidth) {
      lines[lines.length - 1] = candidate
      return
    }

    lines.push(word)
  })

  return lines
}

function resolvePoiLabelFontSize(lines, maxWidth, maxHeight) {
  for (let fontSize = 18; fontSize >= 10; fontSize -= 1) {
    const widestLine = Math.max(
      ...lines.map((line) => estimateTextWidth(line, fontSize)),
      0,
    )
    const totalHeight = lines.length * fontSize * 1.18

    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      return fontSize
    }
  }

  return 10
}

function estimateTextWidth(text, fontSize) {
  return [...String(text ?? '')].reduce((width, character) => {
    if (character === ' ') {
      return width + fontSize * 0.34
    }

    return width + fontSize * (/[ -~]/.test(character) ? 0.58 : 0.92)
  }, 0)
}

function extendLastLegToDestinationPoi(mapLegs, pois = []) {
  if (!Array.isArray(mapLegs) || mapLegs.length === 0 || !Array.isArray(pois)) {
    return mapLegs
  }

  const lastLegIndex = findLastLegWithPathIndex(mapLegs)
  if (lastLegIndex < 0) {
    return mapLegs
  }

  const lastLeg = mapLegs[lastLegIndex]
  const path = toValidMapPoints(lastLeg.path)
  const lastPoint = path[path.length - 1]
  const destinationPoi = findDestinationPoi(lastLeg, lastPoint, pois)

  if (!destinationPoi || isSameMapPoint(lastPoint, destinationPoi)) {
    return mapLegs
  }

  return mapLegs.map((leg, index) =>
    index === lastLegIndex
      ? {
          ...leg,
          path: [...path, { x: destinationPoi.x, y: destinationPoi.y }],
        }
      : leg,
  )
}

function findLastLegWithPathIndex(mapLegs) {
  for (let index = mapLegs.length - 1; index >= 0; index -= 1) {
    if (toValidMapPoints(mapLegs[index]?.path).length > 0) {
      return index
    }
  }

  return -1
}

function findDestinationPoi(leg, lastPoint, pois) {
  const destinationName = normalizePoiName(
    leg?.endName ??
      leg?.raw?.endName ??
      leg?.rawLeg?.endName ??
      leg?.steps?.[leg.steps.length - 1]?.instruction,
  )
  const namedPoi = destinationName
    ? pois.find((poi) => normalizePoiName(poi.name) === destinationName)
    : null

  if (namedPoi) {
    return namedPoi
  }

  if (!isValidMapPoint(lastPoint)) {
    return null
  }

  let nearestPoi = null
  let nearestDistance = Infinity

  pois.forEach((poi) => {
    if (!isValidMapPoint(poi)) {
      return
    }

    const distance = getSquaredDistance(lastPoint, poi)

    if (distance < nearestDistance) {
      nearestPoi = poi
      nearestDistance = distance
    }
  })

  return nearestDistance <= DESTINATION_POI_SNAP_RADIUS_PX ** 2
    ? nearestPoi
    : null
}

function normalizePoiName(value) {
  return String(value ?? '')
    .replace(/도착|까지|이동|출발|에서/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
}

function isSameMapPoint(pointA, pointB) {
  return (
    isValidMapPoint(pointA) &&
    isValidMapPoint(pointB) &&
    Math.abs(pointA.x - pointB.x) < 1 &&
    Math.abs(pointA.y - pointB.y) < 1
  )
}

function getSquaredDistance(pointA, pointB) {
  const dx = pointA.x - pointB.x
  const dy = pointA.y - pointB.y
  return dx * dx + dy * dy
}

function geoJsonToPath(geometry) {
  const type = getGeometryType(geometry)

  if (type === 'Polygon') {
    return polygonToPath(geometry.coordinates)
  }

  if (type === 'LineString') {
    return lineStringToPath(geometry.coordinates)
  }

  return null
}

function polygonToPath(rings) {
  if (!Array.isArray(rings)) {
    return null
  }

  const path = rings
    .map((ring) => {
      const points = coordinatesToPoints(ring)
      if (points.length < 3) return null
      const [firstPoint, ...restPoints] = points
      return [
        `M ${firstPoint.x} ${firstPoint.y}`,
        ...restPoints.map((point) => `L ${point.x} ${point.y}`),
        'Z',
      ].join(' ')
    })
    .filter(Boolean)
    .join(' ')

  return path || null
}

function lineStringToPath(coordinates) {
  const points = coordinatesToPoints(coordinates)
  if (points.length < 2) {
    return null
  }

  const [firstPoint, ...restPoints] = points
  return [
    `M ${firstPoint.x} ${firstPoint.y}`,
    ...restPoints.map((point) => `L ${point.x} ${point.y}`),
  ].join(' ')
}

function geoJsonToPoint(geometry) {
  if (getGeometryType(geometry) !== 'Point') {
    return null
  }

  return coordinateToPoint(geometry.coordinates)
}

function getGeometryBounds(geometry) {
  const points = getGeometryPoints(geometry)
  if (points.length === 0) {
    return null
  }

  const bounds = points.reduce(
    (currentBounds, point) => ({
      minX: Math.min(currentBounds.minX, point.x),
      minY: Math.min(currentBounds.minY, point.y),
      maxX: Math.max(currentBounds.maxX, point.x),
      maxY: Math.max(currentBounds.maxY, point.y),
    }),
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  )

  return {
    ...bounds,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    center: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    },
  }
}

function getGeometryPoints(geometry) {
  const type = getGeometryType(geometry)

  if (type === 'Point') {
    const point = geoJsonToPoint(geometry)
    return point ? [point] : []
  }

  if (type === 'LineString') {
    return coordinatesToPoints(geometry.coordinates)
  }

  if (type === 'Polygon' && Array.isArray(geometry?.coordinates)) {
    return geometry.coordinates.flatMap(coordinatesToPoints)
  }

  return []
}

function coordinatesToPoints(coordinates) {
  if (!Array.isArray(coordinates)) {
    return []
  }

  return coordinates.map(coordinateToPoint).filter(Boolean)
}

function coordinateToPoint(coordinate) {
  if (!Array.isArray(coordinate) || coordinate.length < 2) {
    return null
  }

  const x = Number(coordinate[0])
  const y = Number(coordinate[1])

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return { x, y }
}

function getGeometryType(geometry) {
  return String(geometry?.type ?? '')
}

function toPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
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
  if (!activeStep) {
    return null
  }

  if (isArrivalStep(activeStep)) {
    const arrivalPoint = findActiveFocusPoint(mapLegs, activeStep)

    return arrivalPoint
      ? {
          ...arrivalPoint,
          id: `${arrivalPoint.id}-marker`,
          color: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
        }
      : null
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
    color: 'var(--blue-700)',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  }
}

function findActiveFocusPoint(mapLegs, activeStep) {
  if (!activeStep) {
    return null
  }

  const leg = findActiveLeg(mapLegs, activeStep)

  if (!leg) {
    return null
  }

  const path = toValidMapPoints(leg.path)
  if (path.length === 0) {
    return null
  }

  if (isArrivalStep(activeStep)) {
    const lastPoint = path[path.length - 1]
    return {
      id: `${activeStep.id ?? leg.id}-arrival-focus`,
      x: lastPoint.x,
      y: lastPoint.y,
    }
  }

  const startIndex = Number.isInteger(activeStep.pathStartIndex)
    ? activeStep.pathStartIndex
    : activeStep.pathIndex
  const endIndex = Number.isInteger(activeStep.pathEndIndex)
    ? activeStep.pathEndIndex
    : startIndex
  const point =
    getPathRangeCenter(path, startIndex, endIndex) ??
    path[Math.max(Math.min(startIndex ?? 0, path.length - 1), 0)]

  return {
    id: `${activeStep.id ?? leg.id}-active-focus`,
    x: point.x,
    y: point.y,
  }
}

function findActiveLeg(mapLegs, activeStep) {
  const matchedLeg = mapLegs.find((item) =>
    [item?.id, item?.segmentId, item?.mapLegId]
      .filter(Boolean)
      .includes(activeStep.segmentId ?? activeStep.mapLegId),
  )

  if (matchedLeg) {
    return matchedLeg
  }

  if (isArrivalStep(activeStep)) {
    const lastLegIndex = findLastLegWithPathIndex(mapLegs)
    return lastLegIndex >= 0 ? mapLegs[lastLegIndex] : null
  }

  return null
}

function getPathRangeCenter(path, startIndex, endIndex) {
  if (!Array.isArray(path) || path.length === 0) {
    return null
  }

  if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) {
    return null
  }

  const from = Math.max(Math.min(startIndex, endIndex), 0)
  const to = Math.min(Math.max(startIndex, endIndex), path.length - 1)
  const segmentPoints = path.slice(from, to + 1).filter(isValidMapPoint)

  if (segmentPoints.length === 0) {
    return null
  }

  const center = segmentPoints.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 },
  )

  return {
    x: center.x / segmentPoints.length,
    y: center.y / segmentPoints.length,
  }
}

function isArrivalStep(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}

  return String(safeStep.instruction ?? '').includes('도착')
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
