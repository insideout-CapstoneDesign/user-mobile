import {
  getSquaredDistance,
  isValidMapPoint,
  toValidMapPoints,
} from './floorplanGeometry'
import { normalizePublishedMap } from './floorplanVectorMap'

const DESTINATION_POI_SNAP_RADIUS_PX = 180

export function normalizeFloorplanViewModel(floorplan, mapLeg, activeStep, publishedMap) {
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
