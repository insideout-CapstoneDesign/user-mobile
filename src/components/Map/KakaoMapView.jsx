import { useRef } from 'react'
import useCurrentLocationOnKakaoMap from '../../hooks/map/useCurrentLocationOnKakaoMap'
import useKakaoMapInstance from '../../hooks/map/useKakaoMapInstance'
import usePoiSelectionOnMap from '../../hooks/map/usePoiSelectionOnMap'
import useSingleMarkerOnMap from '../../hooks/map/useSingleMarkerOnMap'
import CurrentLocationControl from './CurrentLocationControl'
import { MapRoot, MapState, MapViewport } from './KakaoMapView.styles'

export default function KakaoMapView({
  center = { lat: 37.478095, lng: 126.951744 },
  level = 3,
  pois = [],
  selectionRadiusMeters = 40,
  onPoiSelect,
  onMapClick,
  markerPosition = null,
}) {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
  const mapRef = useRef(null)
  const { map, status, errorMessage } = useKakaoMapInstance({
    appKey,
    mapRef,
    center,
    level,
  })

  usePoiSelectionOnMap({
    map,
    pois,
    selectionRadiusMeters,
    onPoiSelect,
    onMapClick,
  })
  useSingleMarkerOnMap({ map, markerPosition })

  const { isLocating, geoMessage, moveToCurrentLocation } =
    useCurrentLocationOnKakaoMap(map)

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
    <MapRoot>
      <MapViewport ref={mapRef} />
      {status === 'loading' ? <MapState>지도를 불러오는 중...</MapState> : null}
      {status === 'ready' ? (
        <CurrentLocationControl
          isLocating={isLocating}
          message={geoMessage}
          onLocate={moveToCurrentLocation}
        />
      ) : null}
    </MapRoot>
  )
}
