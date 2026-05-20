import { PORTAL_TYPE } from '../constants/auth'
import { AUTH_ERROR_MESSAGE, ERROR_MESSAGE } from '../constants/errorMessages'
import getErrorMessage from './utils/getErrorMessage'

const LOGIN_PATH = '/api/v1/auth/login'
const USER_SIGNUP_PATH = '/api/v1/auth/signup/user'

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
  }

  return apiBaseUrl
}

async function postJson(path, payload, options = {}) {
  const { fallbackMessage = ERROR_MESSAGE.DEFAULT, statusMap = {}, codeMap = {} } = options

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

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

  return data?.result ?? data
}

export function signupUser({ email, password, displayName }) {
  return postJson(
    USER_SIGNUP_PATH,
    {
      email,
      password,
      displayName,
    },
    {
      fallbackMessage: AUTH_ERROR_MESSAGE.SIGNUP_FAILED,
    },
  )
}

export function loginUser({ email, password }) {
  return postJson(
    LOGIN_PATH,
    {
      email,
      password,
      portalType: PORTAL_TYPE.USER,
    },
    {
      statusMap: {
        401: AUTH_ERROR_MESSAGE.LOGIN_FAILED,
      },
      codeMap: {
        LOGIN_FAILED: AUTH_ERROR_MESSAGE.LOGIN_FAILED,
      },
      fallbackMessage: ERROR_MESSAGE.DEFAULT,
    },
  )
}
