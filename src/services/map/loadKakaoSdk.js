const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'
let kakaoSdkPromise

function createKakaoSdkLoadError() {
  const origin = window.location.origin
  const { hostname } = window.location
  const localDomainHint =
    hostname === '127.0.0.1'
      ? ' Kakao Developers에는 localhost와 127.0.0.1이 다른 도메인으로 처리되므로 http://localhost:5173 으로 접속하거나, 현재 origin을 Web 플랫폼 도메인에 추가해주세요.'
      : ''

  return new Error(
    `Kakao Maps SDK 로딩에 실패했습니다. 현재 origin: ${origin}.${localDomainHint}`,
  )
}

export default function loadKakaoSdk(appKey) {
  if (!appKey) {
    return Promise.reject(new Error('Kakao Maps appKey가 없습니다.'))
  }

  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (kakaoSdkPromise) return kakaoSdkPromise

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${KAKAO_SDK_URL}?appkey=${encodeURIComponent(appKey)}&autoload=false`
    script.async = true

    script.onload = () => {
      if (!window.kakao?.maps) {
        kakaoSdkPromise = null
        reject(new Error('Kakao Maps SDK를 찾을 수 없습니다.'))
        return
      }

      window.kakao.maps.load(() => resolve(window.kakao))
    }

    script.onerror = () => {
      kakaoSdkPromise = null
      reject(createKakaoSdkLoadError())
    }

    document.head.appendChild(script)
  })

  return kakaoSdkPromise
}
