import { useState } from 'react'
import BottomNav from '../../components/BottomNav/BottomNav'
import KakaoMapView from '../../components/Map/KakaoMapView'
import SearchInput from '../../components/SearchInput/SearchInput'
import './MapPage.css'

export default function MapPage() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentNav, setCurrentNav] = useState('map')

  return (
    <main className="map-page">
      <div className="map-page__viewport">
        <KakaoMapView />
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
    </main>
  )
}
