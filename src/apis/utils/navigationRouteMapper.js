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
import { simplifyTransitLineName } from '../../utils/transitLineFormatter'

const TRANSIT_TYPES = new Set(['bus', 'subway'])

export function normalizeRouteOption(route, index) {
  const routeType = route.routeType ?? 'WALK'
  const routeOption = route.routeOption ?? null
  const mode = routeType.toLowerCase()
  const optionKey = (routeOption ?? 'option').toString().toLowerCase()
  const id = `${mode}-${optionKey}-${index}`
  const meta = ROUTE_OPTION_META[routeOption] ?? ROUTE_OPTION_META[routeType] ?? {}
  const legs = Array.isArray(route.legs) ? route.legs : []
  const startsIndoor = doesRouteStartIndoor(legs)
  const totalTime = formatTotalDuration(
    route.totalDuration,
    route.totalTimeSeconds,
    { indoorPrefix: startsIndoor },
  )
  const mapLegs = normalizeMapLegs(legs, { routeId: id, routeType, routeOption })
  const turnByTurnSteps = normalizeTurnByTurnSteps(legs, { routeId: id, routeType, routeOption })

  return {
    id,
    routeType,
    routeOption,
    mode,
    startsIndoor,
    active: index === 0,
    totalTime,
    name: meta.label ?? routeOption ?? routeType,
    time: totalTime,
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

function doesRouteStartIndoor(legs) {
  const firstLegMode = String(legs[0]?.mode ?? '').toUpperCase()
  return firstLegMode === 'INDOOR' || firstLegMode === 'CAMPUS'
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
  const name = leg.startName || buildLegTitle(leg)

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

  return simplifyTransitLineName(rawName, type)
}

function buildRouteBarLineLabel(leg, type = modeToUiType(leg?.mode)) {
  const label = buildTransitLineLabel(leg, type)

  if (type !== 'bus' || !label) {
    return label
  }

  return label.split(',')[0].trim()
}
