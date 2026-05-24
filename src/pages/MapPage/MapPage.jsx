import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import KakaoMapView from '../../components/Map/KakaoMapView'
import MapPoiSheet from '../../components/Map/MapPoiSheet'
import SearchInput from '../../components/SearchInput/SearchInput'
import { mockMapPois } from '../../mocks/map/poi.mock'
import { mockSearchPlaces } from '../../mocks/search/searchPage.mock'
import isRegisteredPlace from '../../utils/map/isRegisteredPlace'
import { resolvePoiFromSearch } from '../../utils/map/searchPoiResolver'
import './MapPage.css'

export default function MapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSearchPlace = location.state?.selectedSearchPlace
  const [currentNav, setCurrentNav] = useState('map')
  const [selectedPoi, setSelectedPoi] = useState(() =>
    resolvePoiFromSearch(selectedSearchPlace, mockMapPois),
  )
  const registeredPlaces = useMemo(
    () => mockSearchPlaces.filter((place) => place.isRegistered),
    [],
  )
  const isSelectedPoiRegistered = useMemo(
    () => isRegisteredPlace(selectedPoi, registeredPlaces),
    [registeredPlaces, selectedPoi],
  )

  const closePoiSheet = () => {
    setSelectedPoi(null)
  }

  const openSearchPage = () => {
    navigate('/search')
  }

  return (
    <main className="map-page">
      <div className="map-page__viewport">
        <KakaoMapView pois={mockMapPois} onPoiSelect={setSelectedPoi} />
      </div>

      <div className="map-page__search">
        <SearchInput
          value=""
          placeholder="건물, 장소 검색"
          readOnly
          onClick={openSearchPage}
        />
      </div>

      <BottomNav currentKey={currentNav} onChange={setCurrentNav} />

      <MapPoiSheet
        key={selectedPoi?.id ?? 'map-poi-sheet'}
        isOpen={!!selectedPoi}
        place={selectedPoi}
        isRegistered={isSelectedPoiRegistered}
        onClose={closePoiSheet}
      />
    </main>
  )
}
