import { ERROR_MESSAGE, PLACE_ERROR_MESSAGE } from '../constants/errorMessages'
import getErrorMessage from './utils/getErrorMessage'

const NEAREST_PLACE_PATH = '/api/v1/places/nearest'
const PLACE_DETAIL_PATH = '/api/v1/places/detail'
const SEARCH_PLACES_PATH = '/api/v1/places/search'
const SUGGEST_PLACES_PATH = '/api/v1/places/suggest'
const REQUEST_TIMEOUT_MS = 10000
const NO_PLACE_CODES = new Set(['PLACE_INFO_NOT_AVAILABLE', 'PLACE200_1'])

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
  }

  return apiBaseUrl
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function hasLocation(lat, lng) {
  return isFiniteNumber(lat) && isFiniteNumber(lng)
}

function validateLocationPair(lat, lng) {
  const hasLat = isFiniteNumber(lat)
  const hasLng = isFiniteNumber(lng)

  if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
    const error = new Error(PLACE_ERROR_MESSAGE.INVALID_COORDINATE)
    error.code = 'PLACE400_1'
    throw error
  }
}

function validateSize(size) {
  if (size === undefined) return

  if (!Number.isInteger(size) || size <= 0) {
    const error = new Error('size 값이 올바르지 않습니다.')
    error.code = 'PLACE400_3'
    throw error
  }
}

function buildSearchQuery({ keyword, lat, lng, radius, size }) {
  if (!keyword?.trim()) return null
  validateLocationPair(lat, lng)
  validateSize(size)

  if (radius !== undefined && !hasLocation(lat, lng)) {
    const error = new Error(PLACE_ERROR_MESSAGE.INVALID_COORDINATE)
    error.code = 'PLACE400_1'
    throw error
  }

  if (radius !== undefined && (!isFiniteNumber(radius) || radius <= 0)) {
    const error = new Error(PLACE_ERROR_MESSAGE.INVALID_RADIUS)
    error.code = 'PLACE400_2'
    throw error
  }

  const queryParams = {
    q: keyword.trim(),
  }

  if (hasLocation(lat, lng)) {
    queryParams.lat = String(lat)
    queryParams.lng = String(lng)
  }

  if (radius !== undefined) {
    queryParams.radius = String(radius)
  }

  if (size !== undefined) {
    queryParams.size = String(size)
  }

  return new URLSearchParams(queryParams).toString()
}

function buildPlaceDetailQuery({ placeId, externalApiId }) {
  const queryParams = new URLSearchParams()

  if (placeId) {
    queryParams.set('placeId', String(placeId))
  } else if (externalApiId) {
    queryParams.set('externalApiId', String(externalApiId))
  }

  if (!queryParams.toString()) {
    const error = new Error('장소 식별 정보가 없습니다.')
    error.code = 'PLACE400_1'
    throw error
  }

  return queryParams.toString()
}

function getPlaceCodeMap(fallbackType = 'search') {
  return {
    PLACE400_1: PLACE_ERROR_MESSAGE.INVALID_COORDINATE,
    PLACE400_2: PLACE_ERROR_MESSAGE.INVALID_RADIUS,
    PLACE400_3: PLACE_ERROR_MESSAGE.INVALID_QUERY,
    PLACE503_1: PLACE_ERROR_MESSAGE.KAKAO_UNAVAILABLE,
    PLACE503_2: PLACE_ERROR_MESSAGE.SEARCH_UNAVAILABLE,
    INVALID_COORDINATE: PLACE_ERROR_MESSAGE.INVALID_COORDINATE,
    INVALID_RADIUS: PLACE_ERROR_MESSAGE.INVALID_RADIUS,
    SEARCH_INVALID_QUERY: PLACE_ERROR_MESSAGE.INVALID_QUERY,
    KAKAO_LOCAL_API_UNAVAILABLE: PLACE_ERROR_MESSAGE.KAKAO_UNAVAILABLE,
    SEARCH_SERVICE_UNAVAILABLE: PLACE_ERROR_MESSAGE.SEARCH_UNAVAILABLE,
    ...(fallbackType === 'suggest'
      ? { COMMON400_1: PLACE_ERROR_MESSAGE.INVALID_QUERY }
      : {}),
  }
}

async function getJson(path, options = {}) {
  const { fallbackMessage = ERROR_MESSAGE.DEFAULT, statusMap = {}, codeMap = {} } =
    options

  const abortController = new AbortController()
  const timeoutId = window.setTimeout(
    () => abortController.abort(),
    REQUEST_TIMEOUT_MS,
  )

  let response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'GET',
      headers: {
        Accept: '*/*',
      },
      signal: abortController.signal,
    })
  } catch (error) {
    const networkMessage =
      error?.name === 'AbortError'
        ? ERROR_MESSAGE.TIMEOUT
        : ERROR_MESSAGE.NETWORK
    throw new Error(networkMessage, { cause: error })
  } finally {
    window.clearTimeout(timeoutId)
  }

  let data = null

  try {
    data = await response.json()
  } catch (error) {
    const isNoContentResponse = response.status === 204 || response.status === 205
    if (!isNoContentResponse && response.ok) {
      throw new Error('서버 응답을 해석하지 못했습니다.', { cause: error })
    }
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
      }),
    )
    error.status = response.status
    error.code = data?.code
    throw error
  }

  return data
}

export async function getNearestPlace({ lat, lng, radius = 30 }) {
  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) {
    const error = new Error('좌표 정보가 올바르지 않습니다.')
    error.code = 'PLACE400_1'
    throw error
  }

  if (!isFiniteNumber(radius) || radius <= 0) {
    const error = new Error('반경 정보가 올바르지 않습니다.')
    error.code = 'PLACE400_2'
    throw error
  }

  const query = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  }).toString()

  const data = await getJson(`${NEAREST_PLACE_PATH}?${query}`, {
    fallbackMessage: '장소 정보를 불러오지 못했습니다.',
    codeMap: getPlaceCodeMap(),
  })

  if (NO_PLACE_CODES.has(data?.code) || data?.result == null) {
    return { place: null, code: data?.code ?? 'PLACE_INFO_NOT_AVAILABLE' }
  }

  return { place: data.result, code: data?.code }
}

export async function getPlaceDetail({ placeId, externalApiId }) {
  const query = buildPlaceDetailQuery({ placeId, externalApiId })

  const data = await getJson(`${PLACE_DETAIL_PATH}?${query}`, {
    fallbackMessage: '장소 상세 정보를 불러오지 못했습니다.',
  })

  return data?.result ?? null
}

export async function searchPlaces({ keyword, lat, lng, radius, size }) {
  const query = buildSearchQuery({ keyword, lat, lng, radius, size })
  if (!query) return []

  const data = await getJson(`${SEARCH_PLACES_PATH}?${query}`, {
    fallbackMessage: PLACE_ERROR_MESSAGE.SEARCH_FAILED,
    codeMap: getPlaceCodeMap('search'),
  })

  const rawResult = data?.result

  if (Array.isArray(rawResult)) return rawResult
  if (Array.isArray(rawResult?.content)) return rawResult.content

  return []
}

export async function suggestPlaces({ keyword, lat, lng, size }) {
  const query = buildSearchQuery({ keyword, lat, lng, size })
  if (!query) return []

  const data = await getJson(`${SUGGEST_PLACES_PATH}?${query}`, {
    fallbackMessage: PLACE_ERROR_MESSAGE.SUGGEST_FAILED,
    codeMap: getPlaceCodeMap('suggest'),
  })

  const rawResult = data?.result

  if (Array.isArray(rawResult)) return rawResult
  if (Array.isArray(rawResult?.content)) return rawResult.content

  return []
}
