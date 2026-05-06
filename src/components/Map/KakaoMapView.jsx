import { useEffect, useRef, useState } from 'react'
import { MapState, MapViewport } from './KakaoMapView.styles'

const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'
let kakaoSdkPromise

function loadKakaoSdk(appKey) {
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

export default function KakaoMapView({
  center = { lat: 37.478095, lng: 126.951744 },
  level = 3,
}) {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
  const mapRef = useRef(null)
  const [status, setStatus] = useState(appKey ? 'loading' : 'error-key')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!appKey) return

    let isMounted = true

    loadKakaoSdk(appKey)
      .then((kakao) => {
        if (!isMounted || !mapRef.current) return

        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng)
        // 지도 초기 렌더링 1회만 수행
        new kakao.maps.Map(mapRef.current, { center: mapCenter, level })
        setStatus('ready')
      })
      .catch((error) => {
        if (!isMounted) return
        console.error('[KakaoMapView] SDK load error:', error)
        setErrorMessage(error?.message || 'SDK 초기화 중 오류가 발생했습니다.')
        setStatus('error-sdk')
      })

    return () => {
      isMounted = false
    }
  }, [appKey, center.lat, center.lng, level])

  if (status === 'error-key') {
    return <MapState>카카오맵 키가 설정되지 않았습니다.</MapState>
  }

  if (status === 'error-sdk') {
    return (
      <MapState>
        지도를 불러오지 못했습니다.
        <br />
        {errorMessage}
      </MapState>
    )
  }

  return (
    <>
      <MapViewport ref={mapRef} />
      {status === 'loading' ? <MapState>지도를 불러오는 중...</MapState> : null}
    </>
  )
}
