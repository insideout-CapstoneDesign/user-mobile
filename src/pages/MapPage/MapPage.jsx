import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNearestPlace } from '../../apis/placeApi'
import BottomNav from '../../components/BottomNav/BottomNav'
import KakaoMapView from '../../components/Map/KakaoMapView'
import MapPoiSheet from '../../components/Map/MapPoiSheet'
import SearchInput from '../../components/SearchInput/SearchInput'
import { ROUTES } from '../../constants/routes'
import { mockMapPois } from '../../mocks/map/poi.mock'
import { mockSearchPlaces } from '../../mocks/search/searchPage.mock'
import isRegisteredPlace from '../../utils/map/isRegisteredPlace'
import { getMapViewportState, isValidMapCenter, isValidMapLevel } from '../../utils/map/mapViewport'
import { DEFAULT_ROUTE_ORIGIN } from '../../utils/map/navigationPlaceMapper'
import { resolvePoiFromSearch } from '../../utils/map/searchPoiResolver'
import './MapPage.css'

const NEAREST_RADIUS_METERS = 30
const NOTICE_TIMEOUT_MS = 2400
const NO_PLACE_CODE = 'PLACE_INFO_NOT_AVAILABLE'
function mapNearestPlaceToPoi(place) {
  return {
    id:
      place.externalApiId ??
      place.id ??
      `${place.name ?? place.placeName ?? 'place'}-${place.lat}-${place.lng}`,
    name: place.name ?? place.placeName ?? place.title ?? '장소명',
    address: place.roadAddress || place.address || '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId,
  }
}

function mapRoutePlaceToPoi(place) {
  if (!place) return null

  return {
    id: place.externalApiId ?? place.id ?? `route-${place.name ?? place.title ?? 'place'}`,
    name: place.name ?? place.title ?? '장소명',
    address: place.address ?? place.roadAddress ?? '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId ?? null,
  }
}

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
  const [mapNotice, setMapNotice] = useState('')
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState(() =>
    isValidMapCenter({
      lat: initialSelectedPoi?.lat,
      lng: initialSelectedPoi?.lng,
    })
      ? { lat: initialSelectedPoi.lat, lng: initialSelectedPoi.lng }
      : null,
  )
  const [selectedPoi, setSelectedPoi] = useState(initialSelectedPoi)
  const requestSeqRef = useRef(0)
  const noticeTimerRef = useRef(null)
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
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current)
      }
    }
  }, [])

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

  const showMapNotice = (message) => {
    setMapNotice(message)

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current)
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setMapNotice('')
    }, NOTICE_TIMEOUT_MS)
  }

  const closePoiSheet = () => {
    setSelectedPoi(null)
    setSelectedMarkerPosition(null)
  }

  const openSearchPage = () => {
    navigate(ROUTES.SEARCH)
  }

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSearchPage()
    }
  }

  const handleBottomNavChange = (key) => {
    if (key === 'navigation') {
      navigate(ROUTES.ROUTING_SEARCH, {
        state: {
          routeOrigin,
          routeDestination,
          mapCenter,
          mapLevel,
        },
      })
      return
    }

    setCurrentNav(key)
  }

  const openRoutingFromMapPoi = (field, place) => {
    if (!place) return

    const normalizedPlace = {
      ...place,
      name: place.name ?? place.title ?? '장소',
      title: place.name ?? place.title ?? '장소',
      address: place.address ?? '주소 정보 없음',
      lat: place.lat,
      lng: place.lng,
      externalApiId: place.externalApiId ?? place.id ?? null,
      isRegistered: Boolean(place.isRegistered),
    }

    const nextState =
      field === 'origin'
        ? {
            routeOrigin: normalizedPlace,
            routeDestination: routeDestination ?? null,
            selectedRouteField: 'destination',
          }
        : {
            routeOrigin: routeOrigin ?? DEFAULT_ROUTE_ORIGIN,
            routeDestination: normalizedPlace,
            selectedRouteField: 'origin',
          }

    navigate(ROUTES.ROUTING_SEARCH, {
      state: {
        ...nextState,
        selectedMapPlace: normalizedPlace,
        mapCenter,
        mapLevel,
      },
    })
  }

  const handleCurrentLocationSelect = ({ lat, lng }) => {
    setMapCenter({ lat, lng })
    setSelectedPoi(null)
    setSelectedMarkerPosition({ lat, lng })
    setMapNotice('')
  }

  const handleMapClick = async ({ lat, lng }) => {
    const requestId = ++requestSeqRef.current

    try {
      const { place, code } = await getNearestPlace({
        lat,
        lng,
        radius: NEAREST_RADIUS_METERS,
      })

      if (requestId !== requestSeqRef.current) return

      if (!place) {
        setSelectedPoi(null)
        setSelectedMarkerPosition(null)
        if (code === NO_PLACE_CODE || code === 'PLACE200_1') {
          showMapNotice('해당 위치의 장소 정보를 찾을 수 없어요.')
        }
        return
      }

      const mappedPoi = mapNearestPlaceToPoi(place)
      setMapNotice('')
      setSelectedPoi(mappedPoi)
      setMapCenter({
        lat: mappedPoi.lat,
        lng: mappedPoi.lng,
      })
      setSelectedMarkerPosition({
        lat: mappedPoi.lat,
        lng: mappedPoi.lng,
      })
    } catch (error) {
      if (requestId !== requestSeqRef.current) return
      setSelectedPoi(null)
      setSelectedMarkerPosition(null)
      showMapNotice(error?.message ?? '장소 정보를 불러오지 못했습니다.')
    }
  }

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
