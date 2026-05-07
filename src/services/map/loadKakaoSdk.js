const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'
let kakaoSdkPromise

export default function loadKakaoSdk(appKey) {
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (kakaoSdkPromise) return kakaoSdkPromise

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${KAKAO_SDK_URL}?appkey=${appKey}&autoload=false`
    script.async = true

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error('Kakao Maps SDK를 찾을 수 없습니다.'))
        return
      }

      window.kakao.maps.load(() => resolve(window.kakao))
    }

    script.onerror = () => {
      reject(new Error('Kakao Maps SDK 로딩에 실패했습니다.'))
    }

    document.head.appendChild(script)
  })

  return kakaoSdkPromise
}
