import { UI_TYPE_BY_LEG_MODE } from '../../constants/navigation'
import { formatDistance, formatDuration } from '../../utils/navigationFormatters'

export function normalizeMapLegs(legs, routeContext) {
  return legs.flatMap((leg, legIndex) => {
    const floorSegments = Array.isArray(leg.floorSegments) ? leg.floorSegments : []

    if (floorSegments.length > 0) {
      return floorSegments.map((segment, segmentIndex) =>
        normalizeMapSegment(segment, leg, {
          ...routeContext,
          legIndex,
          segmentIndex,
        }),
      )
    }

    if (!leg.mapImageUrl && !Array.isArray(leg.path)) {
      return []
    }

    return [
      normalizeMapSegment(leg, leg, {
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

function shouldShowTurnByTurnStep(step) {
  return !isRouteSegmentSummaryStep(step)
}

function isRouteSegmentSummaryStep(step = {}) {
  const instruction = normalizeInstructionText(step.instruction)

  if (!instruction || isEndpointInstruction(instruction)) {
    return false
  }

  if (hasManeuverInstruction(instruction)) {
    return false
  }

  const distancePattern = buildDistanceInstructionPattern(step.distanceText)

  if (!distancePattern.test(instruction)) {
    return false
  }

  return true
}

function normalizeInstructionText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isEndpointInstruction(instruction) {
  return instruction.includes('도착') || instruction.includes('출발') || instruction.includes('현재 위치')
}

function hasManeuverInstruction(instruction) {
  return /좌회전|우회전|직진|유턴|계단|엘리베이터|에스컬레이터|횡단보도|따라|이동|통과|후/.test(
    instruction,
  )
}

function buildDistanceInstructionPattern(distanceText) {
  const normalizedDistance = normalizeInstructionText(distanceText)
  const distanceSource = normalizedDistance
    ? escapeRegExp(normalizedDistance)
    : '\\d+(?:\\.\\d+)?\\s*(?:m|km)'

  return new RegExp(`^(?:.*?(?:,\\s*|\\s+))?${distanceSource}(?:\\s*\\([^)]*\\))?$`, 'i')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
  const path = Array.isArray(segment.path) ? segment.path : []
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

export function modeToUiType(mode) {
  return UI_TYPE_BY_LEG_MODE[String(mode ?? '').toUpperCase()] ?? 'point'
}
