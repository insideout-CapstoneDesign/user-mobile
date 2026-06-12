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
// Default fallback duration for indoor legs in route bars, in minutes.
const DEFAULT_INDOOR_LEG_MINUTES = 6

export function normalizeRouteOption(route, index, responseContext = {}) {
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
  const turnByTurnSteps = normalizeExitSteps(
    normalizeTurnByTurnSteps(legs, { routeId: id, routeType, routeOption }),
    legs,
    responseContext.indoor,
  )

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
  return isIndoorLeg(legs[0])
}

function normalizeExitSteps(steps, legs, indoorMeta) {
  if (!Array.isArray(steps) || steps.length === 0 || !doesRouteStartIndoor(legs)) {
    return steps
  }

  const firstOutdoorLegIndex = legs.findIndex((leg) => !isIndoorLeg(leg))
  if (firstOutdoorLegIndex <= 0) {
    return steps
  }

  const lastIndoorStepIndex = findLastStepIndexBeforeLeg(steps, firstOutdoorLegIndex)
  if (lastIndoorStepIndex < 0) {
    return steps
  }

  const exitInstruction = buildExitInstruction(legs, indoorMeta)
  if (!exitInstruction) {
    return steps
  }

  return steps.map((step, stepIndex) =>
    stepIndex === lastIndoorStepIndex
      ? {
          ...step,
          instruction: exitInstruction,
        }
      : step,
  )
}

function findLastStepIndexBeforeLeg(steps, legIndex) {
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    if (steps[index]?.legIndex < legIndex) {
      return index
    }
  }

  return -1
}

function buildExitInstruction(legs, indoorMeta) {
  const entranceName =
    getCleanText(indoorMeta?.campusEntranceName) ??
    getCleanText(indoorMeta?.entranceName) ??
    getExitLegEndpointName(legs)

  return entranceName ? `${entranceName}로 나가기` : null
}

function getExitLegEndpointName(legs) {
  const indoorLegs = legs.filter(isIndoorLeg)
  const exitLeg = indoorLegs[indoorLegs.length - 1]
  const path = Array.isArray(exitLeg?.path) ? exitLeg.path : []
  const lastPathName = getCleanText(path[path.length - 1]?.name)

  return getCleanText(exitLeg?.endName) ?? lastPathName
}

function getCleanText(value) {
  const text = String(value ?? '').trim()

  return text ? text : null
}

function isIndoorLeg(leg) {
  const mode = String(leg?.mode ?? '').toUpperCase()

  return mode === 'INDOOR' || mode === 'CAMPUS'
}

function normalizeRouteSegments(legs) {
  return legs
    .map((leg) => {
      if (!leg || typeof leg !== 'object') {
        return null
      }

      const minutes = secondsToMinutes(leg.durationSeconds)
      const type = normalizeRouteBarType(modeToUiType(leg.mode))

      if (minutes === null && type !== 'indoor') {
        return null
      }

      return {
        type,
        minutes: minutes ?? DEFAULT_INDOOR_LEG_MINUTES,
        line: buildRouteBarLineLabel(leg, type),
        routeColor: leg.routeColor,
        routeId: leg.routeId,
        routeNm: leg.routeNm,
        typeCode: leg.type,
      }
    })
    .filter(Boolean)
}

function normalizeRouteBarType(type) {
  return type === 'campus' ? 'indoor' : type
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
  if (!leg || typeof leg !== 'object') {
    return null
  }

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
