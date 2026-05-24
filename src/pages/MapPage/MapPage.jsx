import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../../components/BottomSheet/types/BottomSheetCompactInfo'
import KakaoMapView from '../../components/Map/KakaoMapView'
import SearchInput from '../../components/SearchInput/SearchInput'
import { mockMapPois } from '../../mocks/map/poi.mock'
import './MapPage.css'

export default function MapPage() {
  const navigate = useNavigate()
  const [currentNav, setCurrentNav] = useState('map')
  const [selectedPoi, setSelectedPoi] = useState(null)

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

      <BottomSheetBase isOpen={!!selectedPoi} onClose={closePoiSheet}>
        <BottomSheetCompactInfo
          place={selectedPoi}
          onDeparture={closePoiSheet}
          onArrival={closePoiSheet}
        />
      </BottomSheetBase>
    </main>
  )
}
