import { useCallback, useState } from 'react'

export default function useCurrentLocation() {
  const [isLocating, setIsLocating] = useState(false)
  const [geoMessage, setGeoMessage] = useState('')

  const requestCurrentLocation = useCallback(({ onSuccess } = {}) => {
    if (!navigator.geolocation) {
      setGeoMessage('현재 기기에서 위치 정보를 지원하지 않습니다.')
      return
    }

    setIsLocating(true)
    setGeoMessage('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onSuccess?.({ latitude, longitude })
        setIsLocating(false)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoMessage('위치 권한을 허용하면 현재 위치를 확인할 수 있어요.')
        } else {
          setGeoMessage('현재 위치를 가져오지 못했습니다.')
        }
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [])

  return {
    isLocating,
    geoMessage,
    requestCurrentLocation,
  }
}
