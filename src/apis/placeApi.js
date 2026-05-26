import { ERROR_MESSAGE } from '../constants/errorMessages'
import getErrorMessage from './utils/getErrorMessage'

const NEAREST_PLACE_PATH = '/api/v1/places/nearest'
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
    codeMap: {
      PLACE400_1: '좌표 정보가 올바르지 않습니다.',
      PLACE400_2: '반경 정보가 올바르지 않습니다.',
    },
  })

  if (NO_PLACE_CODES.has(data?.code) || data?.result == null) {
    return { place: null, code: data?.code ?? 'PLACE_INFO_NOT_AVAILABLE' }
  }

  return { place: data.result, code: data?.code }
}
