export const ERROR_MESSAGE = {
  DEFAULT: '요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  NETWORK: '네트워크 연결을 확인해 주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해 주세요.',
}

export const AUTH_ERROR_MESSAGE = {
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
  SIGNUP_FAILED: '회원가입에 실패했습니다. 입력 정보를 확인해 주세요.',
}

export const PLACE_ERROR_MESSAGE = {
  INVALID_COORDINATE: '좌표 정보가 올바르지 않습니다.',
  INVALID_RADIUS: '반경 정보가 올바르지 않습니다.',
  INVALID_QUERY: '검색어를 확인해 주세요.',
  KAKAO_UNAVAILABLE: '외부 지도 검색 서비스에 일시적인 문제가 발생했습니다.',
  SEARCH_UNAVAILABLE: '검색 서비스에 일시적인 문제가 발생했습니다.',
  SEARCH_FAILED: '검색 결과를 불러오지 못했습니다.',
  SUGGEST_FAILED: '자동완성 결과를 불러오지 못했습니다.',
}

export const PROFILE_ERROR_MESSAGE = {
  UNAUTHORIZED: '로그인이 필요합니다. 다시 로그인해 주세요.',
  LOAD_FAILED: '프로필 정보를 불러오지 못했습니다.',
  UPDATE_FAILED: '프로필 정보를 저장하지 못했습니다.',
}
