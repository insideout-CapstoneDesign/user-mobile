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

  if (!isTransit) {
    return {
      id: `${routeId}-raw-detail-${index}`,
      type: 'walk',
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
  const explicitCount =
    toFiniteNumber(leg.stopCount) ??
    toFiniteNumber(leg.stationCount) ??
    toFiniteNumber(leg.passStopCount) ??
    toFiniteNumber(leg.passStationCount) ??
    toFiniteNumber(leg.viaStopCount) ??
    toFiniteNumber(leg.viaStationCount)

  return explicitCount ?? stops.length
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
