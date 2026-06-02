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

      if (minutes === null) {
        return null
      }

      return {
        type: modeToUiType(leg.mode),
        minutes,
        line: leg.routeName,
        routeColor: leg.routeColor,
        routeId: leg.routeId,
        routeNm: leg.routeNm,
        typeCode: leg.type,
      }
    })
    .filter(Boolean)
}

function normalizeRouteSummarySteps(legs) {
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
