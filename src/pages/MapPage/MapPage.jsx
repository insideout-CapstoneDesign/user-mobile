import { useState } from 'react'
import BottomNav from '../../components/BottomNav/BottomNav'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../../components/BottomSheet/types/BottomSheetCompactInfo'
import KakaoMapView from '../../components/Map/KakaoMapView'
import SearchInput from '../../components/SearchInput/SearchInput'
import { mockMapPois } from '../../mocks/map/poi.mock'
import './MapPage.css'

export default function MapPage() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentNav, setCurrentNav] = useState('map')
  const [selectedPoi, setSelectedPoi] = useState(null)

  const closePoiSheet = () => {
    setSelectedPoi(null)
  }

  return (
    <main className="map-page">
      <div className="map-page__viewport">
        <KakaoMapView pois={mockMapPois} onPoiSelect={setSelectedPoi} />
      </div>

      <div className="map-page__search">
        <SearchInput
          value={searchKeyword}
          onChange={setSearchKeyword}
          onSearch={() => {}}
          placeholder="건물, 장소 검색"
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
