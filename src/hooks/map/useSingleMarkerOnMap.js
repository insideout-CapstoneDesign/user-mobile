import { useEffect, useRef } from 'react'

export default function useSingleMarkerOnMap({ map, markerPosition }) {
  const markerRef = useRef(null)

  useEffect(() => {
    if (!map || !window.kakao?.maps) return

    if (!markerPosition) {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      return
    }

    const target = new window.kakao.maps.LatLng(
      markerPosition.lat,
      markerPosition.lng,
    )

    if (markerRef.current) {
      markerRef.current.setPosition(target)
      return
    }

    markerRef.current = new window.kakao.maps.Marker({
      map,
      position: target,
    })
  }, [map, markerPosition])
}

