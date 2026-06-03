import { ROUTE_OPTION_META } from '../../constants/navigation'
import {
  formatDistance,
  formatDuration,
  formatTotalDuration,
  secondsToMinutes,
} from '../../utils/navigationFormatters'
import {
  modeToUiType,
  normalizeMapLegs,
  normalizeTurnByTurnSteps,
} from './navigationMapMapper'

const TRANSIT_TYPES = new Set(['bus', 'subway'])
const PARENTHETICAL_TEXT_PATTERN = /\([^)]*\)/g
const SUBWAY_LINE_PATTERN = /(?:[0-9]+|[가-힣A-Za-z]+)\s*호선/
const SUBWAY_NOISE_PATTERN = /수도권|서울|지하철|도시철도|급행|완행|일반/g
const BUS_TYPE_WORDS = '간선|지선|광역|마을|일반|급행|직행|좌석|입석|공항|순환|버스'
const LEADING_BUS_TYPE_PATTERN = new RegExp(`^(${BUS_TYPE_WORDS})\\s*[:：-]?\\s*`)
const INLINE_BUS_TYPE_PATTERN = new RegExp(`\\b(${BUS_TYPE_WORDS})\\b\\s*[:：-]?\\s*`, 'g')

export function normalizeRouteOption(route, index) {
  const routeType = route.routeType ?? 'WALK'
  const routeOption = route.routeOption ?? null
  const mode = routeType.toLowerCase()
  const optionKey = (routeOption ?? 'option').toString().toLowerCase()
  const id = `${mode}-${optionKey}-${index}`
  const meta = ROUTE_OPTION_META[routeOption] ?? ROUTE_OPTION_META[routeType] ?? {}
  const legs = Array.isArray(route.legs) ? route.legs : []
  const mapLegs = normalizeMapLegs(legs, { routeId: id, routeType, routeOption })
  const turnByTurnSteps = normalizeTurnByTurnSteps(legs, { routeId: id, routeType, routeOption })

  return {
    id,
    routeType,
    routeOption,
    mode,
    active: index === 0,
    totalTime: formatTotalDuration(route.totalDuration, route.totalTimeSeconds),
    name: meta.label ?? routeOption ?? routeType,
    time: formatTotalDuration(route.totalDuration, route.totalTimeSeconds),
    distance: formatDistance(route.totalDistanceMeters),
    extraInfo: meta.extraInfo,
    segments: normalizeRouteSegments(legs),
    steps: normalizeRouteSummarySteps(legs),
    mapLegs,
    turnByTurnSteps,
    failures: Array.isArray(route.failures) ? route.failures : [],
    raw: route,
  }
}

function normalizeRouteSegments(legs) {
  return legs
    .map((leg) => {
      const minutes = secondsToMinutes(leg.durationSeconds)
      const type = modeToUiType(leg.mode)

      if (minutes === null) {
        return null
      }

      return {
        type,
        minutes,
        line: buildRouteBarLineLabel(leg, type),
        routeColor: leg.routeColor,
        routeId: leg.routeId,
        routeNm: leg.routeNm,
        typeCode: leg.type,
      }
    })
    .filter(Boolean)
}

function normalizeRouteSummarySteps(legs) {
  const transitSteps = buildTransitSummarySteps(legs)

  if (transitSteps.length > 0) {
    return transitSteps
  }

  return buildDefaultSummarySteps(legs)
}

function buildTransitSummarySteps(legs) {
  const transitSteps = legs
    .filter((leg) => isTransitLeg(leg))
    .map(buildTransitBoardingStep)
    .filter(Boolean)

  const lastTransitLeg = findLastTransitLeg(legs)
  const destinationName = lastTransitLeg?.endName

  if (destinationName) {
    transitSteps.push({
      type: 'point',
      name: destinationName,
      sub: null,
    })
  }

  return transitSteps
}

function buildDefaultSummarySteps(legs) {
  return legs
    .map((leg) => {
      const name = buildLegTitle(leg)

      if (!name) {
        return null
      }

      return {
        type: modeToUiType(leg.mode),
        name,
        sub: buildLegSubtitle(leg),
      }
    })
    .filter(Boolean)
}

function buildTransitBoardingStep(leg) {
  const name = leg.startName ?? buildLegTitle(leg)

  if (!name) {
    return null
  }

  const type = modeToUiType(leg.mode)

  return {
    type,
    name,
    sub: buildTransitLineLabel(leg, type),
  }
}

function buildLegTitle(leg) {
  if (leg.routeName) {
    return leg.routeName
  }
  if (leg.startName && leg.endName) {
    return `${leg.startName} → ${leg.endName}`
  }
  if (leg.endName) {
    return `${leg.endName}까지 이동`
  }
  if (leg.startName) {
    return `${leg.startName}에서 출발`
  }
  return null
}

function buildLegSubtitle(leg) {
  const details = [formatDuration(leg.durationSeconds), formatDistance(leg.distanceMeters)]
    .filter(Boolean)

  if (leg.stationCount) {
    details.push(`${leg.stationCount}개 정류장`)
  }

  return details.length > 0 ? details.join(' · ') : null
}

function isTransitLeg(leg) {
  const type = modeToUiType(leg?.mode)
  return TRANSIT_TYPES.has(type)
}

function findLastTransitLeg(legs) {
  for (let index = legs.length - 1; index >= 0; index -= 1) {
    if (isTransitLeg(legs[index])) {
      return legs[index]
    }
  }

  return null
}

function buildTransitLineLabel(leg, type = modeToUiType(leg?.mode)) {
  const rawName = leg?.routeName ?? leg?.routeNm ?? leg?.routeId

  if (!rawName) {
    return null
  }

  const name = String(rawName).trim()

  if (type === 'subway') {
    return simplifySubwayName(name)
  }

  if (type === 'bus') {
    return simplifyBusName(name)
  }

  return name
}

function buildRouteBarLineLabel(leg, type = modeToUiType(leg?.mode)) {
  const label = buildTransitLineLabel(leg, type)

  if (type !== 'bus' || !label) {
    return label
  }

  return label.split(',')[0].trim()
}

function simplifySubwayName(name) {
  const withoutParentheses = name.replace(PARENTHETICAL_TEXT_PATTERN, ' ')
  const lineMatch = withoutParentheses.match(SUBWAY_LINE_PATTERN)

  if (lineMatch) {
    return removeWhitespace(lineMatch[0])
  }

  return normalizeSpaces(withoutParentheses.replace(SUBWAY_NOISE_PATTERN, ' '))
}

function simplifyBusName(name) {
  return normalizeSpaces(
    name
      .replace(LEADING_BUS_TYPE_PATTERN, '')
      .replace(INLINE_BUS_TYPE_PATTERN, ''),
  )
}

function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function removeWhitespace(value) {
  return value.replace(/\s+/g, '')
}
