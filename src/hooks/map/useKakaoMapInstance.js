import { useEffect, useState } from 'react'
import loadKakaoSdk from '../../services/map/loadKakaoSdk'

export default function useKakaoMapInstance({
  appKey,
  mapRef,
  center,
  level,
}) {
  const [status, setStatus] = useState(appKey ? 'loading' : 'error-key')
  const [errorMessage, setErrorMessage] = useState('')
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (!appKey) return

    let isMounted = true

    loadKakaoSdk(appKey)
      .then((kakao) => {
        if (!isMounted || !mapRef.current) return

        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng)
        const nextMap = new kakao.maps.Map(mapRef.current, {
          center: mapCenter,
          level,
        })

        setMap(nextMap)
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
  }, [appKey, center.lat, center.lng, level, mapRef])

  return {
    map,
    status,
    errorMessage,
  }
}
