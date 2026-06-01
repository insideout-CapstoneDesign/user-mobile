import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import KakaoMapView from '../../components/Map/KakaoMapView'
import MapPoiSheet from '../../components/Map/MapPoiSheet'
import SearchInput from '../../components/SearchInput/SearchInput'
import useMapPoiSelection from '../../hooks/map/useMapPoiSelection'
import useMapRoutingBridge from '../../hooks/map/useMapRoutingBridge'
import { ROUTES } from '../../constants/routes'
import { mockMapPois } from '../../mocks/map/poi.mock'
import { mockSearchPlaces } from '../../mocks/search/searchPage.mock'
import isRegisteredPlace from '../../utils/map/isRegisteredPlace'
import { getMapViewportState, isValidMapCenter, isValidMapLevel } from '../../utils/map/mapViewport'
import { mapRoutePlaceToPoi } from '../../utils/map/mapPoiMappers'
import { resolvePoiFromSearch } from '../../utils/map/searchPoiResolver'
import './MapPage.css'

export default function MapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state
  const mapViewportState = getMapViewportState(routeState)
  const routeOrigin = location.state?.routeOrigin ?? null
  const routeDestination = location.state?.routeDestination ?? null
  const selectedSearchPlace = location.state?.selectedSearchPlace
  const selectedMapPlace = location.state?.selectedMapPlace
  const shouldOpenFromSearch = location.state?.openSheetFrom === 'search-result'
  const shouldOpenFromRouting = location.state?.openSheetFrom === 'routing-return'
  const hasInitialViewportFromState =
    isValidMapCenter(routeState?.mapCenter) || isValidMapLevel(routeState?.mapLevel)
  const initialSelectedPoi =
    shouldOpenFromSearch && selectedSearchPlace
      ? resolvePoiFromSearch(selectedSearchPlace, mockMapPois)
      : shouldOpenFromRouting && selectedMapPlace
        ? mapRoutePlaceToPoi(selectedMapPlace)
      : null
  const [currentNav, setCurrentNav] = useState('map')
  const initialMapCenter =
    isValidMapCenter({
      lat: initialSelectedPoi?.lat,
      lng: initialSelectedPoi?.lng,
    })
      ? { lat: initialSelectedPoi.lat, lng: initialSelectedPoi.lng }
      : mapViewportState.mapCenter
  const [mapCenter, setMapCenter] = useState(initialMapCenter)
  const [mapLevel, setMapLevel] = useState(mapViewportState.mapLevel)
  const {
    mapNotice,
    selectedPoi,
    selectedMarkerPosition,
    closePoiSheet,
    handleCurrentLocationSelect,
    handleMapClick,
  } = useMapPoiSelection({
    initialSelectedPoi,
    setMapCenter,
  })
  const {
    openSearchPage,
    handleSearchInputKeyDown,
    handleBottomNavChange,
    openRoutingFromMapPoi,
  } = useMapRoutingBridge({
    navigate,
    routeOrigin,
    routeDestination,
    mapCenter,
    mapLevel,
    setCurrentNav,
  })
  const registeredPlaces = useMemo(
    () => mockSearchPlaces.filter((place) => place.isRegistered),
    [],
  )
  const isSelectedPoiRegistered = useMemo(
    () =>
      typeof selectedPoi?.isRegistered === 'boolean'
        ? selectedPoi.isRegistered
        : isRegisteredPlace(selectedPoi, registeredPlaces),
    [registeredPlaces, selectedPoi],
  )

  useEffect(() => {
    if (shouldOpenFromSearch || hasInitialViewportFromState) return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapCenter({
          lat: coords.latitude,
          lng: coords.longitude,
        })
      },
      () => {
        // 권한 거부/실패 시 기본 중심 좌표(동국대)를 유지합니다.
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [hasInitialViewportFromState, setMapCenter, shouldOpenFromSearch])

  useEffect(() => {
    if (!selectedSearchPlace && !selectedMapPlace) return
    navigate(ROUTES.MAP, { replace: true, state: null })
  }, [navigate, selectedMapPlace, selectedSearchPlace])

  return (
    <main className="map-page">
      <div className="map-page__viewport">
        <KakaoMapView
          center={mapCenter}
          level={mapLevel}
          pois={[]}
          markerPosition={selectedMarkerPosition}
          markerOffsetY={selectedPoi ? -200 : 0}
          onCurrentLocationSelect={handleCurrentLocationSelect}
          onMapClick={handleMapClick}
          onCenterChange={setMapCenter}
          onLevelChange={setMapLevel}
        />
      </div>

      <div className="map-page__search">
        <SearchInput
          value=""
          placeholder="건물, 장소 검색"
          readOnly
          onClick={openSearchPage}
          onKeyDown={handleSearchInputKeyDown}
        />
      </div>
      {mapNotice ? <p className="map-page__notice">{mapNotice}</p> : null}

      <BottomNav currentKey={currentNav} onChange={handleBottomNavChange} />

      <MapPoiSheet
        key={selectedPoi?.id ?? 'map-poi-sheet'}
        isOpen={!!selectedPoi}
        place={selectedPoi}
        isRegistered={isSelectedPoiRegistered}
        onClose={closePoiSheet}
        onDeparture={(place) => openRoutingFromMapPoi('origin', place)}
        onArrival={(place) => openRoutingFromMapPoi('destination', place)}
      />
    </main>
  )
}
