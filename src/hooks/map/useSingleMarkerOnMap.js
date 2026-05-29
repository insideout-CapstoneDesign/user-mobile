import { useEffect, useRef } from 'react'

export default function useSingleMarkerOnMap({
  map,
  markerPosition,
  markerOffsetY = 0,
}) {
  const markerRef = useRef(null)
  const lastAdjustedKeyRef = useRef('')
  const markerMapRef = useRef(null)
  const panTimerRef = useRef(null)

  useEffect(() => {
    if (!map || !window.kakao?.maps) return

    if (!markerPosition) {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      markerMapRef.current = null
      lastAdjustedKeyRef.current = ''
      if (panTimerRef.current) {
        window.clearTimeout(panTimerRef.current)
        panTimerRef.current = null
      }
      return
    }

    const target = new window.kakao.maps.LatLng(
      markerPosition.lat,
      markerPosition.lng,
    )

    if (markerRef.current) {
      if (markerMapRef.current !== map) {
        markerRef.current.setMap(map)
      }
      markerRef.current.setPosition(target)
    } else {
      markerRef.current = new window.kakao.maps.Marker({
        map,
        position: target,
      })
    }
    markerMapRef.current = map

    markerRef.current.setZIndex(10)

    if (!markerOffsetY) return

    const markerKey = `${markerPosition.lat}:${markerPosition.lng}:${markerOffsetY}`
    if (lastAdjustedKeyRef.current === markerKey) return
    lastAdjustedKeyRef.current = markerKey

    map.panTo(target)
    if (panTimerRef.current) {
      window.clearTimeout(panTimerRef.current)
    }
    panTimerRef.current = window.setTimeout(() => {
      map.panBy(0, markerOffsetY)
      panTimerRef.current = null
    }, 0)

    return () => {
      if (panTimerRef.current) {
        window.clearTimeout(panTimerRef.current)
        panTimerRef.current = null
      }
    }
  }, [map, markerOffsetY, markerPosition])
}
