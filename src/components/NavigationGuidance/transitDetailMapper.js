import { formatMinutes } from '../../utils/navigationFormatters'
import { simplifyTransitLineName } from '../../utils/transitLineFormatter'
import { getIntermediateStops } from '../../utils/transitStopMapper'

const DEFAULT_ROUTE_ID = 'transit'

export function buildTransitDetailLegs(routeOption, routeContext = {}) {
  const rawLegs = routeOption?.raw?.legs
  const routeId = routeOption?.id ?? DEFAULT_ROUTE_ID

  if (Array.isArray(rawLegs) && rawLegs.length > 0) {
    const legs = rawLegs
      .map((leg, index) => toRawTransitDetailLeg(leg, routeId, index))
      .filter(isDisplayableLeg)

    return withEndpointLegs(legs, routeId, routeContext)
  }

  const legs = (routeOption?.steps ?? [])
    .map((step, index) => toSummaryTransitDetailLeg(step, routeId, index))
    .filter(isDisplayableLeg)

  return withEndpointLegs(legs, routeId, routeContext)
}

function toRawTransitDetailLeg(leg, routeId, index) {
  if (!isObject(leg)) {
    return null
  }

  const type = getRawLegType(leg.mode)
  const isTransit = type === 'bus' || type === 'subway'

  if (isIndoorLeg(leg.mode)) {
    return {
      id: `${routeId}-raw-detail-${index}`,
      type: 'indoor',
      sourceLegIndex: index,
      title: buildIndoorLegTitle(leg),
      detail: leg.floorName ?? null,
    }
  }

  if (!isTransit) {
    return {
      id: `${routeId}-raw-detail-${index}`,
      type: 'walk',
      sourceLegIndex: index,
      title: buildRawWalkTitle(leg),
      detail: leg.description ?? leg.instruction ?? null,
    }
  }

  const startName = leg.startName ?? leg.fromName ?? '승차 지점'
  const endName = leg.endName ?? leg.toName ?? '하차 지점'
  const stops = getIntermediateStops(leg, startName, endName)

  return {
    id: `${routeId}-raw-detail-${index}`,
    type,
    sourceLegIndex: index,
    routeColor: leg.routeColor,
    line: buildTransitLineLabel(leg, type),
    startName,
    startDetail: leg.startDetail ?? leg.startStationId ?? null,
    stopCount: getTransitStopCount(leg, stops),
    durationText: formatRawDuration(leg.durationSeconds),
    stops,
    endName,
    endDetail: leg.endDetail ?? null,
  }
}

export function buildTransitGuidanceSteps(routeOption) {
  const rawLegs = routeOption?.raw?.legs
  const routeId = routeOption?.id ?? DEFAULT_ROUTE_ID

  if (!Array.isArray(rawLegs) || rawLegs.length === 0) {
    return routeOption?.turnByTurnSteps ?? []
  }

  return rawLegs.flatMap((leg, legIndex) => {
    const type = getRawLegType(leg?.mode)

    if (type === 'bus' || type === 'subway') {
      return buildTransitLegGuidanceStep(routeOption, leg, routeId, legIndex, type)
    }

    const legSteps = getTurnByTurnStepsForLeg(routeOption, legIndex)
    if (legSteps.length > 0) {
      return legSteps.map((step) => ({
        ...step,
        sourceLegIndex: legIndex,
      }))
    }

    return buildWalkLegGuidanceStep(routeOption, leg, routeId, legIndex)
  })
}

function getTurnByTurnStepsForLeg(routeOption, legIndex) {
  const steps = Array.isArray(routeOption?.turnByTurnSteps)
    ? routeOption.turnByTurnSteps
    : []

  return steps.filter((step) => step?.legIndex === legIndex)
}

function buildTransitLegGuidanceStep(routeOption, leg, routeId, legIndex, type) {
  const mapLeg = findMapLegForSourceLeg(routeOption, legIndex)
  const line = buildTransitGuidanceLineLabel(leg, type)
  const stops = getIntermediateStops(
    leg,
    leg?.startName ?? leg?.fromName,
    leg?.endName ?? leg?.toName,
  )
  const stopCount = getTransitStopCount(leg, stops)
  const instruction = [line ? `${line}을 타고` : '대중교통을 타고', `${stopCount}개 정류장 이동`]
    .filter(Boolean)
    .join('\n')

  return [{
    id: `${routeId}-transit-leg-${legIndex}-summary`,
    routeId,
    routeType: routeOption?.routeType ?? 'TRANSIT',
    routeOption: routeOption?.routeOption ?? 'TRANSIT_CANDIDATE',
    legIndex,
    sourceLegIndex: legIndex,
    mapLegId: mapLeg?.id ?? `${routeId}-leg-${legIndex}-segment-0`,
    segmentId: mapLeg?.segmentId ?? mapLeg?.id ?? `${routeId}-leg-${legIndex}-segment-0`,
    segmentIndex: mapLeg?.segmentIndex ?? 0,
    stepIndex: 0,
    pathIndex: 0,
    pathStartIndex: 0,
    pathEndIndex: getLastPathIndex(mapLeg),
    type,
    instruction,
    distanceMeters: leg?.distanceMeters ?? null,
    durationSeconds: leg?.durationSeconds ?? null,
    distanceText: '',
    durationText: formatRawDuration(leg?.durationSeconds),
    x: mapLeg?.path?.[0]?.x ?? null,
    y: mapLeg?.path?.[0]?.y ?? null,
    turnType: null,
    mode: leg?.mode ?? type.toUpperCase(),
    streetName: null,
    floorId: null,
    floorName: null,
    raw: leg,
  }]
}

function buildWalkLegGuidanceStep(routeOption, leg, routeId, legIndex) {
  const mapLeg = findMapLegForSourceLeg(routeOption, legIndex)

  return [{
    id: `${routeId}-walk-leg-${legIndex}-summary`,
    routeId,
    routeType: routeOption?.routeType ?? 'TRANSIT',
    routeOption: routeOption?.routeOption ?? 'TRANSIT_CANDIDATE',
    legIndex,
    sourceLegIndex: legIndex,
    mapLegId: mapLeg?.id ?? `${routeId}-leg-${legIndex}-segment-0`,
    segmentId: mapLeg?.segmentId ?? mapLeg?.id ?? `${routeId}-leg-${legIndex}-segment-0`,
    segmentIndex: mapLeg?.segmentIndex ?? 0,
    stepIndex: 0,
    pathIndex: 0,
    pathStartIndex: 0,
    pathEndIndex: getLastPathIndex(mapLeg),
    type: 'walk',
    instruction: buildTransitInstructionFallback(leg),
    distanceMeters: leg?.distanceMeters ?? null,
    durationSeconds: leg?.durationSeconds ?? null,
    distanceText: leg?.distanceMeters ? `${Math.round(leg.distanceMeters)}m` : '',
    durationText: formatRawDuration(leg?.durationSeconds),
    x: mapLeg?.path?.[0]?.x ?? null,
    y: mapLeg?.path?.[0]?.y ?? null,
    turnType: null,
    mode: leg?.mode ?? 'WALK',
    streetName: null,
    floorId: null,
    floorName: null,
    raw: leg,
  }]
}

function findMapLegForSourceLeg(routeOption, legIndex) {
  const mapLegs = Array.isArray(routeOption?.mapLegs) ? routeOption.mapLegs : []

  return mapLegs.find((leg) => leg?.legIndex === legIndex) ?? null
}

function buildTransitGuidanceLineLabel(leg, type) {
  return leg?.routeName ?? leg?.routeNm ?? leg?.routeId ?? buildTransitLineLabel(leg, type)
}

function getLastPathIndex(mapLeg) {
  const path = Array.isArray(mapLeg?.path) ? mapLeg.path : []

  return Math.max(path.length - 1, 0)
}

function buildTransitInstructionFallback(leg) {
  const startName = leg?.startName ?? leg?.fromName
  const endName = leg?.endName ?? leg?.toName

  if (startName && endName) {
    return `${startName}에서 ${endName}까지 도보 이동`
  }

  return '도보 이동'
}

function toSummaryTransitDetailLeg(step, routeId, index) {
  if (!isObject(step)) {
    return null
  }

  const type = normalizeTransitType(step.type ?? 'walk')
  const isTransit = type === 'bus' || type === 'subway'

  if (!isTransit) {
    return {
      id: `${routeId}-detail-${index}`,
      type: type === 'point' ? 'point' : 'walk',
      title: step.name,
      detail: step.sub,
    }
  }

  return {
    id: `${routeId}-detail-${index}`,
    type,
    line: simplifyTransitLineName(step.sub, type),
    startName: step.name,
    stopCount: 0,
    durationText: '',
    stops: [],
    endName: '하차 지점',
  }
}

function getRawLegType(mode) {
  const normalizedMode = normalizeTransitType(mode)

  if (normalizedMode === 'subway') return 'subway'
  if (normalizedMode === 'bus') return 'bus'

  return 'walk'
}

function isIndoorLeg(mode) {
  const normalizedMode = String(mode ?? '').trim().toUpperCase()

  return normalizedMode === 'INDOOR' || normalizedMode === 'CAMPUS'
}

function buildIndoorLegTitle(leg) {
  if (leg?.startName && leg?.endName) {
    return `${leg.startName}에서 ${leg.endName}까지 실내 이동`
  }

  return '실내 이동'
}

function normalizeTransitType(type) {
  return String(type ?? '').trim().toLowerCase()
}

function buildTransitLineLabel(leg, type) {
  return simplifyTransitLineName(leg.routeName ?? leg.routeNm ?? leg.routeId, type)
}

function buildRawWalkTitle(leg) {
  const distance = leg.distanceMeters ? `${Math.round(leg.distanceMeters)}m` : ''
  const duration = formatRawDuration(leg.durationSeconds)
  const meta = [distance, duration].filter(Boolean).join(' · ')

  return meta ? `도보 ${meta}` : '도보 이동'
}

function formatRawDuration(durationSeconds) {
  if (typeof durationSeconds !== 'number') {
    return ''
  }

  return formatMinutes(Math.max(Math.round(durationSeconds / 60), 1))
}

function getTransitStopCount(leg, stops) {
  if (Array.isArray(stops) && stops.length > 0) {
    return stops.length + 1
  }

  const explicitCount =
    toFiniteNumber(leg.stopCount) ??
    toFiniteNumber(leg.stationCount) ??
    toFiniteNumber(leg.passStopCount) ??
    toFiniteNumber(leg.passStationCount) ??
    toFiniteNumber(leg.viaStopCount) ??
    toFiniteNumber(leg.viaStationCount)

  if (explicitCount !== null && explicitCount !== undefined) {
    return Math.max(explicitCount - 1, 1)
  }

  return 1
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) && number >= 0 ? number : null
}

function withEndpointLegs(legs, routeId, routeContext) {
  return [
    buildEndpointLeg('origin', routeId, routeContext.origin, getFirstLegStartName(legs)),
    ...legs,
    buildEndpointLeg('destination', routeId, routeContext.destination, getLastLegEndName(legs)),
  ].filter(Boolean)
}

function buildEndpointLeg(tone, routeId, place, fallbackName) {
  const name = place?.name ?? fallbackName

  if (!name) {
    return null
  }

  return {
    id: `${routeId}-${tone}`,
    type: 'point',
    tone,
    title: name,
    detail: tone === 'origin' ? '출발지' : '도착지',
  }
}

function getFirstLegStartName(legs) {
  const firstLeg = legs.find((leg) => leg.startName || leg.title)

  return firstLeg?.startName ?? firstLeg?.title ?? null
}

function getLastLegEndName(legs) {
  for (let index = legs.length - 1; index >= 0; index -= 1) {
    if (legs[index].endName || legs[index].title) {
      return legs[index].endName ?? legs[index].title
    }
  }

  return null
}

function isDisplayableLeg(leg) {
  return Boolean(leg?.title || leg?.startName)
}

function isObject(value) {
  return Boolean(value && typeof value === 'object')
}
