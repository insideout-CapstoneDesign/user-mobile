import { useState } from 'react'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import DirectionSearch from '../../components/Direction/DirectionSearch'
import TransportSelector from '../../components/Transport/TransportSelector'
import FloorSelector from '../../components/Floor/FloorSelector'
import SearchResultItem from '../../components/Search/SearchResultItem'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../../components/BottomSheet/types/BottomSheetCompactInfo'
import BottomSheetPlaceDetail from '../../components/BottomSheet/types/BottomSheetPlaceDetail'
import BottomSheetRouteOptions from '../../components/BottomSheet/types/BottomSheetRouteOptions'

// Mock 데이터 임포트
import {
  mockBuilding,
  mockPOIs,
  mockReviews,
  mockReviewSummary,
} from '../../mocks/bottomSheet/buildingDetail.mock'
import { mockCompactPlace } from '../../mocks/bottomSheet/compactInfo.mock'
import {
  mockCarRouteOptions,
  mockTransitRouteOptions,
  mockWalkRouteOptions,
} from '../../mocks/bottomSheet/routeOptions.mock'
import { mockSearchResults } from '../../mocks/search/searchResult.mock'
import { mockFloorList } from '../../mocks/floor/floorData.mock'

import './ComponentTestPage.css'

export default function ComponentTestPage() {
  const [sheetType, setSheetType] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPOIs, setShowPOIs] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const [origin, setOrigin] = useState('공학관 601호')
  const [destination, setDestination] = useState('충무로 4호선 1번출구')
  const [transport, setTransport] = useState('transit')

  const handleSwap = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }
  
  const closeSheet = () => {
    setSheetType(null)
    setShowPOIs(false)
  }

  return (
    <main className='component-test-page' style={{ padding: '0', maxWidth: '375px', margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      <h1>insideout</h1>
      <p className="component-test-description">
        컴포넌트 및 디자인 시스템 통합 테스트
      </p>

      {/* 검색 결과 리스트 */}
      <section style={{ padding: '0 1rem' }}>
        {mockSearchResults.map((item) => (
          <SearchResultItem 
            key={item.id}
            title={item.title}
            address={item.address}
            isRegistered={item.isRegistered}
            onClick={() => alert(`${item.title} 선택됨`)}
          />
        ))}
      </section>
      
      {/* 층 선택기 */}
      <FloorSelector 
        buildingName={mockBuilding.name}
        floors={mockFloorList} 
        activeFloor={selectedFloor} 
        onSelect={setSelectedFloor} 
      />

      {/* 길찾기 검색바 */}
      <DirectionSearch 
        origin={origin}
        destination={destination}
        onSwap={handleSwap}
        onBack={() => alert('이전 페이지로 이동!')} 
      />

      {/* 입력 필드 섹션 */}
      <section style={{ padding: '0 1rem' }}>
        <Input 
          label="이메일" 
          placeholder="example@email.com" 
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        <Input label="비밀번호" type="password" placeholder="8자 이상 입력" />
        <Input label="전화번호" subLabel="선택" placeholder="010-0000-0000" />
      </section>

      {/* 교통수단 선택기 */}
      <TransportSelector 
        activeMode={transport} 
        onSelect={(mode) => setTransport(mode)} 
      />

      {/* 버튼 섹션 */}
      <section className="button-group" style={{ padding: '1rem' }}>
        <Button variant="outline">로그아웃</Button>
        <Button variant="primary">저장</Button>
        <Button disabled>저장 (비활성화)</Button>
        
        <div className="button-row two-col" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Button variant="outline">출발</Button>
          <Button variant="primary">도착</Button>
        </div>
      </section>

      {/* 바텀시트 트리거 버튼들 */}
      <section style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Button variant="primary" onClick={() => setSheetType('A_AUTH')}>장소 상세 (로그인)</Button>
        <Button variant="outline" onClick={() => setSheetType('B_TRANSIT')}>대중교통 경로 정보</Button>
        <Button variant="danger" onClick={() => setSheetType('C')}>간이 정보 (Type C)</Button>
      </section>

      {/* 공통 바텀시트 구성 */}
      <BottomSheetBase isOpen={!!sheetType} onClose={closeSheet}>
        {sheetType === 'A_AUTH' && (
          <BottomSheetPlaceDetail
            isLoggedIn
            building={mockBuilding}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite(p => !p)}
            onSelectFloor={setSelectedFloor}
            selectedFloor={selectedFloor}
            onDeparture={closeSheet}
            onArrival={closeSheet}
            pois={mockPOIs}
            showPOIs={showPOIs}
            onTogglePOIs={() => setShowPOIs(p => !p)}
            reviewSummary={mockReviewSummary}
            reviews={mockReviews}
          />
        )}
        {sheetType === 'B_TRANSIT' && (
          <BottomSheetRouteOptions
            mode="transit"
            options={mockTransitRouteOptions}
            onStartNavigation={closeSheet}
          />
        )}
        {sheetType === 'C' && (
          <BottomSheetCompactInfo
            place={mockCompactPlace}
            onDeparture={closeSheet}
            onArrival={closeSheet}
          />
        )}
      </BottomSheetBase>
    </main>
  )
}