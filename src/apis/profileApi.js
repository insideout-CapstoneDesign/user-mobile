import { AUTH_STORAGE_KEY } from '../constants/auth'
import { ERROR_MESSAGE, PROFILE_ERROR_MESSAGE } from '../constants/errorMessages'
import getErrorMessage from './utils/getErrorMessage'

const REQUEST_TIMEOUT_MS = 10000
const DEFAULT_PROFILE_PATH = '/api/v1/users/me'

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
  }

  return apiBaseUrl
}

function getProfilePath() {
  return import.meta.env.VITE_PROFILE_ME_PATH || DEFAULT_PROFILE_PATH
}

function getProfileUpdatePath() {
  return import.meta.env.VITE_PROFILE_UPDATE_PATH || getProfilePath()
}

function getProfileUpdateMethod() {
  const method = (import.meta.env.VITE_PROFILE_UPDATE_METHOD || 'PATCH').toUpperCase()
  return method === 'PUT' ? 'PUT' : 'PATCH'
}

function getAuthToken() {
  const token = localStorage.getItem(AUTH_STORAGE_KEY.ACCESS_TOKEN)
  if (!token) {
    throw new Error(PROFILE_ERROR_MESSAGE.UNAUTHORIZED)
  }
  return token
}

function normalizeProfile(raw = {}) {
  return {
    email: raw.email ?? '',
    displayName: raw.displayName ?? raw.name ?? raw.nickname ?? '',
    phoneNumber: raw.phoneNumber ?? raw.phone ?? raw.mobile ?? '',
  }
}

function buildProfileUpdatePayload({ displayName, phoneNumber }) {
  const nameKey = import.meta.env.VITE_PROFILE_NAME_KEY || 'displayName'
  const phoneKey = import.meta.env.VITE_PROFILE_PHONE_KEY || 'phoneNumber'
  const payload = {}

  if (displayName !== undefined) {
    payload[nameKey] = displayName
  }

  if (phoneNumber !== undefined) {
    payload[phoneKey] = phoneNumber
  }

  return payload
}

async function requestJson(path, options = {}) {
  const {
    method = 'GET',
    payload,
    fallbackMessage = ERROR_MESSAGE.DEFAULT,
    statusMap = {},
    codeMap = {},
  } = options

  const abortController = new AbortController()
  const timeoutId = window.setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${getAuthToken()}`,
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: abortController.signal,
    })
  } catch (error) {
    const networkMessage =
      error?.name === 'AbortError' ? ERROR_MESSAGE.TIMEOUT : ERROR_MESSAGE.NETWORK
    throw new Error(networkMessage, { cause: error })
  } finally {
    window.clearTimeout(timeoutId)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // 빈 응답 본문은 허용합니다.
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

  return data?.result ?? data ?? {}
}

export async function getMyProfile() {
  const profile = await requestJson(getProfilePath(), {
    method: 'GET',
    fallbackMessage: PROFILE_ERROR_MESSAGE.LOAD_FAILED,
    statusMap: {
      401: PROFILE_ERROR_MESSAGE.UNAUTHORIZED,
    },
    codeMap: {
      COMMON401_1: PROFILE_ERROR_MESSAGE.UNAUTHORIZED,
    },
  })

  return normalizeProfile(profile)
}

export async function updateMyProfile({ displayName, phoneNumber }) {
  const payload = buildProfileUpdatePayload({ displayName, phoneNumber })

  const updatedProfile = await requestJson(getProfileUpdatePath(), {
    method: getProfileUpdateMethod(),
    payload,
    fallbackMessage: PROFILE_ERROR_MESSAGE.UPDATE_FAILED,
    statusMap: {
      401: PROFILE_ERROR_MESSAGE.UNAUTHORIZED,
    },
    codeMap: {
      COMMON401_1: PROFILE_ERROR_MESSAGE.UNAUTHORIZED,
    },
  })

  if (updatedProfile && Object.keys(updatedProfile).length > 0) {
    return normalizeProfile(updatedProfile)
  }

  return normalizeProfile({ displayName, phoneNumber })
}
