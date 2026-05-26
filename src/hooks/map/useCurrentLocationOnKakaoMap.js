import { useCallback } from 'react'
import useCurrentLocation from '../useCurrentLocation'

export default function useCurrentLocationOnKakaoMap(map, onLocated) {
  const { isLocating, geoMessage, requestCurrentLocation } = useCurrentLocation()

  const moveToCurrentLocation = useCallback(() => {
    if (!map || !window.kakao?.maps) return

    requestCurrentLocation({
      onSuccess: ({ latitude, longitude }) => {
        const target = new window.kakao.maps.LatLng(latitude, longitude)

        map.panTo(target)
        onLocated?.({ lat: latitude, lng: longitude })
      },
    })
  }, [map, onLocated, requestCurrentLocation])

  return {
    isLocating,
    geoMessage,
    moveToCurrentLocation,
  }
}
