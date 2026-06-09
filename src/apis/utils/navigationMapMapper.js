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
    const steps = Array.isArray(leg.steps) ? leg.steps : []

    return steps
      .map((step, stepIndex) =>
        normalizeStep(step, {
          ...routeContext,
          legIndex,
          stepIndex,
          leg,
          floorId: leg.floorId ?? null,
          floorName: leg.floorName ?? null,
        }),
      )
      .filter(shouldShowTurnByTurnStep)
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

  return {
    id: `${context.routeId}-leg-${context.legIndex}${segmentPart}-step-${context.stepIndex}`,
    routeId: context.routeId,
    routeType: context.routeType,
    routeOption: context.routeOption,
    legIndex: context.legIndex,
    stepIndex: context.stepIndex,
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
        leg,
        floorId,
        floorName,
      }),
    ),
    raw: segment,
  }
}

function normalizeLegPath(leg) {
  if (Array.isArray(leg?.path) && leg.path.length > 0) {
    return leg.path
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
