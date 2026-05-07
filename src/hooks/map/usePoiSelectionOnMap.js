import { useEffect, useRef } from 'react'
import { findNearestPoiWithinRadius } from '../../utils/map/poiMatcher'

export default function usePoiSelectionOnMap({
  map,
  pois,
  selectionRadiusMeters,
  onPoiSelect,
}) {
  const selectedPoiMarkerRef = useRef(null)

  useEffect(() => {
    if (!map || !window.kakao?.maps?.event) return

    const handleMapClick = (mouseEvent) => {
      if (!pois.length) return

      const clickLatLng = mouseEvent.latLng
      const clickPoint = {
        lat: clickLatLng.getLat(),
        lng: clickLatLng.getLng(),
      }
      const selectedPoi = findNearestPoiWithinRadius(
        clickPoint,
        pois,
        selectionRadiusMeters,
      )

      if (!selectedPoi) {
        if (selectedPoiMarkerRef.current) {
          selectedPoiMarkerRef.current.setMap(null)
          selectedPoiMarkerRef.current = null
        }
        onPoiSelect?.(null)
        return
      }

      const target = new window.kakao.maps.LatLng(selectedPoi.lat, selectedPoi.lng)
      if (selectedPoiMarkerRef.current) {
        selectedPoiMarkerRef.current.setPosition(target)
      } else {
        selectedPoiMarkerRef.current = new window.kakao.maps.Marker({
          map,
          position: target,
        })
      }

      onPoiSelect?.(selectedPoi)
    }

    window.kakao.maps.event.addListener(map, 'click', handleMapClick)

    return () => {
      if (window.kakao?.maps?.event) {
        window.kakao.maps.event.removeListener(map, 'click', handleMapClick)
      }
    }
  }, [map, onPoiSelect, pois, selectionRadiusMeters])
}
