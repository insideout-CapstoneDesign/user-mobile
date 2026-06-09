import { UI_TYPE_BY_LEG_MODE } from '../../constants/navigation'
import { formatDistance, formatDuration } from '../../utils/navigationFormatters'
import { isDistanceSummaryInstruction } from '../../utils/navigationStepFilters'

export function normalizeMapLegs(legs, routeContext) {
  return legs.flatMap((leg, legIndex) => {
    const floorSegments = Array.isArray(leg.floorSegments) ? leg.floorSegments : []
    const legPath = normalizeLegPath(leg)

    if (floorSegments.length > 0) {
      return floorSegments.map((segment, segmentIndex) =>
        normalizeMapSegment(segment, leg, {
          ...routeContext,
          legIndex,
          segmentIndex,
        }),
      )
    }

    if (!leg.mapImageUrl && legPath.length < 2) {
      return []
    }

    return [
      normalizeMapSegment({ ...leg, path: legPath }, leg, {
        ...routeContext,
        legIndex,
        segmentIndex: 0,
      }),
    ]
  })
}

export function normalizeTurnByTurnSteps(legs, routeContext) {
  return legs.flatMap((leg, legIndex) => {
    const floorSegments = Array.isArray(leg.floorSegments) ? leg.floorSegments : []
    if (floorSegments.length > 0) {
      return floorSegments.flatMap((segment, segmentIndex) => {
        const path = normalizeLegPath(segment)
        const steps = Array.isArray(segment.steps) ? segment.steps : []
        const floorId = segment.floorId ?? leg.floorId ?? null
        const floorName = segment.floorName ?? leg.floorName ?? null

        const visibleSteps = steps
          .map((step, stepIndex) =>
            normalizeStep(step, {
              ...routeContext,
              legIndex,
              stepIndex,
              segmentIndex,
              leg,
              path,
              floorId,
              floorName,
            }),
          )
          .filter(shouldShowTurnByTurnStep)

        return assignStepPathRanges(visibleSteps, path)
      })
    }

    const steps = Array.isArray(leg.steps) ? leg.steps : []
    const path = normalizeLegPath(leg)

    const visibleSteps = steps
      .map((step, stepIndex) =>
        normalizeStep(step, {
          ...routeContext,
          legIndex,
          stepIndex,
          segmentIndex: 0,
          leg,
          path,
          floorId: leg.floorId ?? null,
          floorName: leg.floorName ?? null,
        }),
      )
      .filter(shouldShowTurnByTurnStep)

    return assignStepPathRanges(visibleSteps, path)
  })
}

function shouldShowTurnByTurnStep(step = {}) {
  return !isMetaOnlyStep(step) && !isRouteSegmentSummaryStep(step)
}

function isRouteSegmentSummaryStep(step = {}) {
  return isDistanceSummaryInstruction(step.instruction)
}

function isMetaOnlyStep(step = {}) {
  const instruction = String(step.instruction ?? '').trim()
  const hasMeta = [step.distanceText, step.durationText, step.floorName].some(Boolean)

  return !instruction && hasMeta
}

function normalizeStep(step, context) {
  const mode = step.mode ?? context.leg?.mode
  const segmentPart =
    context.segmentIndex === undefined ? '' : `-segment-${context.segmentIndex}`
  const mapLegId = `${context.routeId}-leg-${context.legIndex}-segment-${context.segmentIndex ?? 0}`
  const pathIndex = findNearestPathIndex(step, context.path)

  return {
    id: `${context.routeId}-leg-${context.legIndex}${segmentPart}-step-${context.stepIndex}`,
    routeId: context.routeId,
    routeType: context.routeType,
    routeOption: context.routeOption,
    legIndex: context.legIndex,
    mapLegId,
    segmentId: mapLegId,
    segmentIndex: context.segmentIndex ?? 0,
    stepIndex: context.stepIndex,
    pathIndex,
    pathStartIndex: null,
    pathEndIndex: null,
    type: modeToUiType(mode),
    instruction: step.instruction ?? '',
    distanceMeters: step.distanceMeters ?? null,
    durationSeconds: step.durationSeconds ?? null,
    distanceText: formatDistance(step.distanceMeters),
    durationText: formatDuration(step.durationSeconds),
    x: step.x ?? null,
    y: step.y ?? null,
    turnType: step.turnType ?? null,
    mode,
    streetName: step.streetName ?? null,
    floorId: context.floorId,
    floorName: context.floorName,
    raw: step,
  }
}

function assignStepPathRanges(steps, path) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return []
  }

  let previousPathIndex = 0

  return steps.map((step) => {
    const pathRange = resolveStepPathRange(previousPathIndex, step.pathIndex, path)

    if (Number.isInteger(step.pathIndex)) {
      previousPathIndex = step.pathIndex
    }

    return {
      ...step,
      pathStartIndex: pathRange.start,
      pathEndIndex: pathRange.end,
    }
  })
}

function normalizeMapSegment(segment, leg, context) {
  const path = normalizeLegPath(segment)
  const steps = Array.isArray(segment.steps) ? segment.steps : []
  const floorId = segment.floorId ?? leg.floorId ?? null
  const floorName = segment.floorName ?? leg.floorName ?? null

  return {
    id: `${context.routeId}-leg-${context.legIndex}-segment-${context.segmentIndex}`,
    routeId: context.routeId,
    routeType: context.routeType,
    routeOption: context.routeOption,
    legIndex: context.legIndex,
    segmentIndex: context.segmentIndex,
    mode: modeToUiType(leg.mode),
    mapType: segment.mapType ?? leg.mapType ?? null,
    mapImageUrl: segment.mapImageUrl ?? leg.mapImageUrl ?? null,
    floorId,
    floorName,
    coordinateType: segment.coordinateType ?? leg.coordinateType ?? null,
    path,
    steps: steps.map((step, stepIndex) =>
      normalizeStep(step, {
        ...context,
        legIndex: context.legIndex,
        stepIndex,
        segmentIndex: context.segmentIndex,
        leg,
        path,
        floorId,
        floorName,
      }),
    ),
    raw: segment,
  }
}

function findNearestPathIndex(step, path) {
  if (!Array.isArray(path) || path.length === 0) {
    return null
  }
  if (typeof step?.x !== 'number' || typeof step?.y !== 'number') {
    return null
  }

  let nearestIndex = null
  let nearestDistance = Infinity

  path.forEach((point, index) => {
    if (typeof point?.x !== 'number' || typeof point?.y !== 'number') {
      return
    }

    const dx = point.x - step.x
    const dy = point.y - step.y
    const distance = dx * dx + dy * dy

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  })

  return nearestIndex
}

function resolveStepPathRange(startIndex, endIndex, path) {
  if (!Array.isArray(path) || path.length < 2) {
    return { start: null, end: null }
  }

  const fallbackEnd = Math.min(1, path.length - 1)
  if (!Number.isInteger(endIndex)) {
    return { start: 0, end: fallbackEnd }
  }

  const safeStart = Number.isInteger(startIndex) ? startIndex : 0
  const from = Math.max(Math.min(safeStart, endIndex), 0)
  const to = Math.min(Math.max(safeStart, endIndex), path.length - 1)

  if (from === to) {
    return {
      start: Math.max(from - 1, 0),
      end: Math.min(from + 1, path.length - 1),
    }
  }

  return { start: from, end: to }
}

function normalizeLegPath(leg) {
  if (Array.isArray(leg?.path) && leg.path.length > 0) {
    return leg.path
  }

  const stops = Array.isArray(leg?.stops) ? leg.stops : []
  const stopPath = stops
    .map((stop) => ({ x: stop?.x, y: stop?.y, name: stop?.name ?? null }))
    .filter(isValidGeographicPoint)

  if (stopPath.length >= 2) {
    return stopPath
  }

  const steps = Array.isArray(leg?.steps) ? leg.steps : []
  return steps
    .map((step) => ({ x: step?.x, y: step?.y, name: step?.instruction ?? null }))
    .filter(isValidGeographicPoint)
}

function isValidGeographicPoint(point) {
  return (
    typeof point?.x === 'number' &&
    typeof point?.y === 'number' &&
    point.x >= -180 &&
    point.x <= 180 &&
    point.y >= -90 &&
    point.y <= 90
  )
}

export function modeToUiType(mode) {
  return UI_TYPE_BY_LEG_MODE[String(mode ?? '').toUpperCase()] ?? 'point'
}
