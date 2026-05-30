import { ERROR_MESSAGE } from '../constants/errorMessages'
import {
  NAVIGATION_NOT_FOUND_CODES,
  NAVIGATION_ROUTES_PATH,
  NAVIGATION_TRANSIT_ROUTES_PATH,
  REQUEST_TIMEOUT_MS,
  ROUTE_TYPE_BY_TRANSPORT_MODE,
} from '../constants/navigation'
import getErrorMessage from './utils/getErrorMessage'
import { isNavigationNotFoundCode } from './utils/navigationErrors'
import normalizeNavigationResponse from './utils/normalizeNavigationResponse'

export {
  NAVIGATION_NOT_FOUND_CODES,
  ROUTE_TYPE_BY_TRANSPORT_MODE,
} from '../constants/navigation'
export { default as normalizeNavigationResponse } from './utils/normalizeNavigationResponse'

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

  const data = await response.json().catch(() => null)

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
