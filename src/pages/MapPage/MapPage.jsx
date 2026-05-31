import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNearestPlace } from '../../apis/placeApi'
import BottomNav from '../../components/BottomNav/BottomNav'
import KakaoMapView from '../../components/Map/KakaoMapView'
import MapPoiSheet from '../../components/Map/MapPoiSheet'
import SearchInput from '../../components/SearchInput/SearchInput'
import './MapPage.css'

const NEAREST_RADIUS_METERS = 30
const NOTICE_TIMEOUT_MS = 2400
const NO_PLACE_CODE = 'PLACE_INFO_NOT_AVAILABLE'
const DEFAULT_MAP_CENTER = { lat: 37.558107, lng: 126.998945 }

function mapNearestPlaceToPoi(place) {
  return {
    id: place.externalApiId ?? `${place.name ?? 'place'}-${place.lat}-${place.lng}`,
    name: place.name ?? '장소명',
    address: place.roadAddress || place.address || '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId,
  }
}

function mapSearchPlaceToPoi(place) {
  if (!place) return null

  const hasLat = typeof place.lat === 'number' && Number.isFinite(place.lat)
  const hasLng = typeof place.lng === 'number' && Number.isFinite(place.lng)

  return {
    id: place.externalApiId ?? `search-${place.title ?? place.name ?? 'place'}`,
    name: place.title ?? place.name ?? '장소명',
    address: place.address ?? place.roadAddress ?? '주소 정보 없음',
    lat: hasLat ? place.lat : null,
    lng: hasLng ? place.lng : null,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId,
  }
}

export default function MapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSearchPlace = location.state?.selectedSearchPlace
  const shouldOpenFromSearch = location.state?.openSheetFrom === 'search-result'
  const initialSelectedPoi =
    shouldOpenFromSearch && selectedSearchPlace
      ? mapSearchPlaceToPoi(selectedSearchPlace)
      : null
  const shouldSkipAutoLocateRef = useRef(Boolean(initialSelectedPoi))
  const [currentNav, setCurrentNav] = useState('map')
  const [mapCenter, setMapCenter] = useState(() =>
    initialSelectedPoi &&
    typeof initialSelectedPoi.lat === 'number' &&
    typeof initialSelectedPoi.lng === 'number'
      ? { lat: initialSelectedPoi.lat, lng: initialSelectedPoi.lng }
      : DEFAULT_MAP_CENTER,
  )
  const [mapNotice, setMapNotice] = useState('')
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState(() =>
    initialSelectedPoi &&
    typeof initialSelectedPoi.lat === 'number' &&
    typeof initialSelectedPoi.lng === 'number'
      ? { lat: initialSelectedPoi.lat, lng: initialSelectedPoi.lng }
      : null,
  )
  const [selectedPoi, setSelectedPoi] = useState(initialSelectedPoi)
  const requestSeqRef = useRef(0)
  const noticeTimerRef = useRef(null)
  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (shouldSkipAutoLocateRef.current) return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapCenter({
          lat: coords.latitude,
          lng: coords.longitude,
        })
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [])

  useEffect(() => {
    if (!selectedSearchPlace) return
    navigate('/map', { replace: true, state: null })
  }, [navigate, selectedSearchPlace])

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
    navigate('/search')
  }

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSearchPage()
    }
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
          pois={[]}
          markerPosition={selectedMarkerPosition}
          markerOffsetY={selectedPoi ? -200 : 0}
          onCurrentLocationSelect={handleCurrentLocationSelect}
          onMapClick={handleMapClick}
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

      <BottomNav currentKey={currentNav} onChange={setCurrentNav} />

      <MapPoiSheet
        key={selectedPoi?.id ?? 'map-poi-sheet'}
        isOpen={!!selectedPoi}
        place={selectedPoi}
        isRegistered={Boolean(selectedPoi?.isRegistered)}
        onClose={closePoiSheet}
      />
    </main>
  )
}
