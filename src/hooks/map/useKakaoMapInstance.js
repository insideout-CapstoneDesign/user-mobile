import { useEffect, useRef, useState } from 'react'
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
  const kakaoRef = useRef(null)
  const initialCenterRef = useRef(center)
  const initialLevelRef = useRef(level)

  useEffect(() => {
    if (!appKey) return

    let isMounted = true

    loadKakaoSdk(appKey)
      .then((kakao) => {
        if (!isMounted || !mapRef.current) return

        kakaoRef.current = kakao
        const mapCenter = new kakao.maps.LatLng(
          initialCenterRef.current.lat,
          initialCenterRef.current.lng,
        )
        const nextMap = new kakao.maps.Map(mapRef.current, {
          center: mapCenter,
          level: initialLevelRef.current,
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
  }, [appKey, mapRef])

  useEffect(() => {
    if (!map || !kakaoRef.current) return

    const currentCenter = map.getCenter()
    const currentLat = currentCenter.getLat()
    const currentLng = currentCenter.getLng()

    if (currentLat === center.lat && currentLng === center.lng) {
      return
    }

    map.setCenter(new kakaoRef.current.maps.LatLng(center.lat, center.lng))
  }, [center.lat, center.lng, map])

  useEffect(() => {
    if (!map || typeof level !== 'number' || !Number.isFinite(level)) return
    if (map.getLevel() === level) return

    map.setLevel(level)
  }, [level, map])

  return {
    map,
    status,
    errorMessage,
  }
}
