import { useCallback, useRef } from 'react'
import useCurrentLocation from '../useCurrentLocation'

export default function useCurrentLocationOnKakaoMap(map) {
  const currentMarkerRef = useRef(null)
  const { isLocating, geoMessage, requestCurrentLocation } = useCurrentLocation()

  const moveToCurrentLocation = useCallback(() => {
    if (!map || !window.kakao?.maps) return

    requestCurrentLocation({
      onSuccess: ({ latitude, longitude }) => {
        const target = new window.kakao.maps.LatLng(latitude, longitude)

        map.panTo(target)

        if (currentMarkerRef.current) {
          currentMarkerRef.current.setPosition(target)
          return
        }

        currentMarkerRef.current = new window.kakao.maps.Marker({
          map,
          position: target,
        })
      },
    })
  }, [map, requestCurrentLocation])

  return {
    isLocating,
    geoMessage,
    moveToCurrentLocation,
  }
}
