import { useEffect, useRef } from 'react'

export default function useSingleMarkerOnMap({
  map,
  markerPosition,
  markerOffsetY = 0,
}) {
  const markerRef = useRef(null)
  const lastAdjustedKeyRef = useRef('')

  useEffect(() => {
    if (!map || !window.kakao?.maps) return

    if (!markerPosition) {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      lastAdjustedKeyRef.current = ''
      return
    }

    const target = new window.kakao.maps.LatLng(
      markerPosition.lat,
      markerPosition.lng,
    )

    if (markerRef.current) {
      markerRef.current.setPosition(target)
    } else {
      markerRef.current = new window.kakao.maps.Marker({
        map,
        position: target,
      })
    }

    markerRef.current.setZIndex(10)

    if (!markerOffsetY) return

    const markerKey = `${markerPosition.lat}:${markerPosition.lng}:${markerOffsetY}`
    if (lastAdjustedKeyRef.current === markerKey) return
    lastAdjustedKeyRef.current = markerKey

    map.panTo(target)
    window.setTimeout(() => {
      map.panBy(0, markerOffsetY)
    }, 0)
  }, [map, markerOffsetY, markerPosition])
}
