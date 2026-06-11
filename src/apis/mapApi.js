import { ERROR_MESSAGE } from '../constants/errorMessages'
import getErrorMessage from './utils/getErrorMessage'

const PUBLISHED_FLOOR_MAP_PATH = '/api/v1/maps/floors'
const REQUEST_TIMEOUT_MS = 10000

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
  }

  return apiBaseUrl
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
      error?.name === 'AbortError' ? ERROR_MESSAGE.TIMEOUT : ERROR_MESSAGE.NETWORK
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
    throw error
  }

  return data?.result ?? data
}

export async function fetchPublishedFloorMap(floorId) {
  const normalizedFloorId = normalizeFloorId(floorId)

  if (!normalizedFloorId) {
    return null
  }

  return getJson(`${PUBLISHED_FLOOR_MAP_PATH}/${encodeURIComponent(normalizedFloorId)}`, {
    fallbackMessage: '실내 지도를 불러올 수 없습니다.',
  })
}

function normalizeFloorId(floorId) {
  if (typeof floorId !== 'string' && typeof floorId !== 'number') {
    return null
  }

  const normalizedFloorId = String(floorId).trim()
  return normalizedFloorId ? normalizedFloorId : null
}
