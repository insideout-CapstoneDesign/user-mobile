import { ERROR_MESSAGE } from '../constants/errorMessages'
import getErrorMessage from './utils/getErrorMessage'

const NAVIGATION_ROUTES_PATH = '/api/v1/navigation/routes'
const NAVIGATION_TRANSIT_ROUTES_PATH = '/api/v1/navigation/transit/routes'
const REQUEST_TIMEOUT_MS = 10000

export const NAVIGATION_NOT_FOUND_CODES = [
  'NAVIGATION404_1',
  'NAVIGATION404_2',
  'NAVIGATION404_3',
]

export const ROUTE_TYPE_BY_TRANSPORT_MODE = {
  car: 'CAR',
  transit: 'TRANSIT',
  walk: 'WALK',
}

const ROUTE_OPTION_META = {
  TRANSIT_CANDIDATE: {
    label: '대중교통',
    extraInfo: null,
  },
  RECOMMENDED: {
    label: '내비 추천',
    extraInfo: null,
  },
  MIN_TIME: {
    label: '최소 시간',
    extraInfo: null,
  },
  SHORTEST: {
    label: '최단 거리',
    extraInfo: null,
  },
  COMFORTABLE: {
    label: '편안한 길',
    extraInfo: '계단과 장애물을 덜 지나는 경로',
  },
}

const UI_TYPE_BY_LEG_MODE = {
  BUS: 'bus',
  CAR: 'car',
  SUBWAY: 'subway',
  WALK: 'walk',
  INDOOR: 'indoor',
  CAMPUS: 'campus',
  OTHER: 'point',
}

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
  }

  return apiBaseUrl
}

async function postJson(path, payload, options = {}) {
  const { fallbackMessage = ERROR_MESSAGE.DEFAULT, statusMap = {}, codeMap = {} } = options

  const abortController = new AbortController()
  const timeoutId = window.setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS)

  let response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    })
  } catch (error) {
    const networkMessage = error?.name === 'AbortError' ? ERROR_MESSAGE.TIMEOUT : ERROR_MESSAGE.NETWORK
    throw new Error(networkMessage, { cause: error })
  } finally {
    window.clearTimeout(timeoutId)
  }

  let data = null

  try {
    data = await response.json()
  } catch {
    // 응답 본문이 없는 경우를 고려해 파싱 오류를 무시합니다.
  }

  if (!response.ok || data?.isSuccess === false) {
    const error = new Error(
      getErrorMessage({
        status: response.status,
        code: data?.code,
        message: data?.message,
        fallbackMessage,
        statusMap,
        codeMap,
        exposeRawMessage: false,
      }),
    )
    error.status = response.status
    error.code = data?.code
    error.response = data
    error.isNavigationNotFound = isNavigationNotFoundCode(data?.code)
    throw error
  }

  return data?.result ?? data
}

export function buildNavigationRequest({
  start,
  end,
  startName,
  endName,
  startPoiId,
  destinationBuildingId,
  destinationPoiId,
  includeIndoor = true,
  transportMode,
  routeTypes,
}) {
  return {
    startX: start?.x,
    startY: start?.y,
    endX: end?.x,
    endY: end?.y,
    startName: startName ?? start?.name,
    endName: endName ?? end?.name,
    startPoiId,
    destinationBuildingId,
    destinationPoiId,
    includeIndoor,
    routeTypes: normalizeRouteTypes(routeTypes, transportMode),
  }
}

export async function findNavigationRoutes(request) {
  const result = await postJson(NAVIGATION_ROUTES_PATH, request, {
    fallbackMessage: '경로를 찾을 수 없습니다.',
    codeMap: navigationErrorCodeMap(),
  })

  return normalizeNavigationResponse(result)
}

export async function findTransitNavigationRoutes(request) {
  const result = await postJson(NAVIGATION_TRANSIT_ROUTES_PATH, request, {
    fallbackMessage: '경로를 찾을 수 없습니다.',
    codeMap: navigationErrorCodeMap(),
  })

  return normalizeNavigationResponse(result)
}

export function normalizeNavigationResponse(response = {}) {
  const routes = Array.isArray(response.routes) ? response.routes : []
  const failures = normalizeFailures(response)
  const routeOptions = routes.map((route, index) => normalizeRouteOption(route, index))
  const mapLegs = routeOptions.flatMap((option) => option.mapLegs)
  const turnByTurnSteps = routeOptions.flatMap((option) => option.turnByTurnSteps)

  return {
    raw: response,
    requestedDestination: response.requestedDestination ?? null,
    routedDestination: response.routedDestination ?? null,
    indoor: response.indoor ?? null,
    message: response.message ?? null,
    routes,
    routeOptions,
    mapLegs,
    turnByTurnSteps,
    failures,
    hasNavigationNotFoundFailure: hasNavigationNotFoundFailure(failures),
  }
}

function normalizeRouteOption(route, index) {
  const routeType = route.routeType ?? 'WALK'
  const routeOption = route.routeOption ?? null
  const mode = routeType.toLowerCase()
  const id = `${mode}-${(routeOption ?? index).toString().toLowerCase()}`
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

function normalizeMapLegs(legs, routeContext) {
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

function normalizeTurnByTurnSteps(legs, routeContext) {
  return legs.flatMap((leg, legIndex) => {
    const steps = Array.isArray(leg.steps) ? leg.steps : []

    return steps.map((step, stepIndex) =>
      normalizeStep(step, {
        ...routeContext,
        legIndex,
        stepIndex,
        leg,
        floorId: leg.floorId ?? null,
        floorName: leg.floorName ?? null,
      }),
    )
  })
}

function normalizeStep(step, context) {
  const mode = step.mode ?? context.leg?.mode

  return {
    id: `${context.routeId}-leg-${context.legIndex}-step-${context.stepIndex}`,
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

function normalizeFailures(response) {
  const rootFailures = Array.isArray(response.failures) ? response.failures : []
  const routeFailures = (Array.isArray(response.routes) ? response.routes : [])
    .flatMap((route) => (Array.isArray(route.failures) ? route.failures : []))

  return [...rootFailures, ...routeFailures].filter(Boolean)
}

function normalizeRouteTypes(routeTypes, transportMode) {
  if (Array.isArray(routeTypes) && routeTypes.length > 0) {
    return routeTypes.map((type) => String(type).toUpperCase())
  }

  const routeType = ROUTE_TYPE_BY_TRANSPORT_MODE[transportMode]
  return routeType ? [routeType] : undefined
}

function navigationErrorCodeMap() {
  return NAVIGATION_NOT_FOUND_CODES.reduce((codeMap, code) => {
    codeMap[code] = '경로를 찾을 수 없습니다.'
    return codeMap
  }, {})
}

function hasNavigationNotFoundFailure(failures) {
  return failures.some((failure) => isNavigationNotFoundCode(failure?.code))
}

function isNavigationNotFoundCode(code) {
  return typeof code === 'string' && code.startsWith('NAVIGATION404_')
}

function modeToUiType(mode) {
  return UI_TYPE_BY_LEG_MODE[String(mode ?? '').toUpperCase()] ?? 'point'
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

function formatDuration(seconds) {
  const minutes = secondsToMinutes(seconds)
  return minutes === null ? null : `${minutes}분`
}

function formatTotalDuration(totalDuration, totalTimeSeconds) {
  if (totalDuration) {
    return totalDuration.replace(/\s*\+\s*/g, '+').replace(/\s*실내\s*이동/g, '실내이동')
  }

  return formatDuration(totalTimeSeconds)
}

function secondsToMinutes(seconds) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
    return null
  }

  return Math.max(1, Math.ceil(seconds / 60))
}

function formatDistance(meters) {
  if (typeof meters !== 'number' || Number.isNaN(meters)) {
    return null
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`
  }

  return `${meters}m`
}
