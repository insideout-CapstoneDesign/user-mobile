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

  const floorList = mockBuilding.floors.map(f => f < 0 ? `B${Math.abs(f)}` : `${f}F`);
  const searchResults = [
    { id: 1, title: mockBuilding.name, address: mockBuilding.address, isRegistered: true },
    { id: 2, title: mockCompactPlace.name, address: mockCompactPlace.address, isRegistered: false },
    { id: 3, title: '중앙도서관', address: '서울시 관악구 관악로 2', isRegistered: true },
  ];

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
        Button/BottomSheet 공통 컴포넌트 테스트
      </p>

        {searchResults.map((item) => (
          <SearchResultItem 
            key={item.id}
            title={item.title}
            address={item.address}
            isRegistered={item.isRegistered}
            onClick={() => alert(`${item.title} 선택됨`)}
          />
        ))}
      
      <FloorSelector 
        buildingName={mockBuilding.name}
        floors={floorList} 
        activeFloor={selectedFloor} 
        onSelect={setSelectedFloor} 
      />

      <DirectionSearch 
        origin={origin}
        destination={destination}
        onSwap={handleSwap}
        onBack={() => alert('이전 페이지로 이동!')} 
      />

        <Input 
          label="이메일" 
          placeholder="example@email.com" 
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        <Input 
          label="비밀번호" 
          type="password" 
          placeholder="8자 이상 입력" 
        />
        <Input 
          label="전화번호" 
          subLabel="선택" 
          placeholder="010-0000-0000" 
        />

      <TransportSelector 
        activeMode={transport} 
        onSelect={(mode) => setTransport(mode)} 
      />

      <div className="button-section">
        <Button variant="outline">로그아웃</Button>
      </div>

      <div className="button-section">
        <Button variant="primary">저장</Button>
      </div>

      <div className="button-section">
        <Button disabled>저장 (비활성화)</Button>
      </div>

      <div className="button-row two-col">
        <div className="button-cell">
          <Button variant="outline">출발</Button>
        </div>
        <div className="button-cell">
          <Button variant="primary">도착</Button>
        </div>
      </div>

      <div className="button-row two-col danger-row">
        <div className="button-cell">
          <Button variant="outline">취소</Button>
        </div>
        <div className="button-cell">
          <Button variant="danger">탈퇴하기</Button>
        </div>
      </div>

      <div className="button-section">
        <Button variant="primary" onClick={() => setSheetType('A_AUTH')}>
          Type A 열기 (로그인 - {mockBuilding.name})
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('A_GUEST')}>
          Type A 열기 (비로그인)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('B_WALK')}>
          Type B 열기 (도보 경로)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('B_TRANSIT')}>
          Type B 열기 (대중교통 경로)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('B_CAR')}>
          Type B 열기 (자동차 경로)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="danger" onClick={() => setSheetType('C')}>
          Type C 열기 ({mockCompactPlace.name})
        </Button>
      </div>

      <BottomSheetBase isOpen={!!sheetType} onClose={closeSheet}>
        {sheetType === 'A_AUTH' ? (
          <BottomSheetPlaceDetail
            isLoggedIn
            building={mockBuilding}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite((prev) => !prev)}
            onSelectFloor={setSelectedFloor}
            selectedFloor={selectedFloor}
            onDeparture={closeSheet}
            onArrival={closeSheet}
            pois={mockPOIs}
            showPOIs={showPOIs}
            onTogglePOIs={() => setShowPOIs((prev) => !prev)}
            reviewSummary={mockReviewSummary}
            reviews={mockReviews}
            onWriteReview={closeSheet}
            onMoreReviews={() => {}}
          />
        ) : null}

        {sheetType === 'A_GUEST' ? (
          <BottomSheetPlaceDetail
            isLoggedIn={false}
            building={mockBuilding}
            onSelectFloor={setSelectedFloor}
            selectedFloor={selectedFloor}
            onDeparture={closeSheet}
            onArrival={closeSheet}
            pois={mockPOIs}
            showPOIs={showPOIs}
            onTogglePOIs={() => setShowPOIs((prev) => !prev)}
            reviews={mockReviews}
          />
        ) : null}

        {sheetType === 'B_WALK' ? (
          <BottomSheetRouteOptions
            mode="walk"
            options={mockWalkRouteOptions}
            onSelectOption={() => {}}
            onStartNavigation={closeSheet}
          />
        ) : null}

        {sheetType === 'B_TRANSIT' ? (
          <BottomSheetRouteOptions
            mode="transit"
            options={mockTransitRouteOptions}
            onSelectOption={() => {}}
            onStartNavigation={closeSheet}
          />
        ) : null}

        {sheetType === 'B_CAR' ? (
          <BottomSheetRouteOptions
            mode="car"
            options={mockCarRouteOptions}
            onSelectOption={() => {}}
            onStartNavigation={closeSheet}
          />
        ) : null}

        {sheetType === 'C' ? (
          <BottomSheetCompactInfo
            place={mockCompactPlace}
            onDeparture={closeSheet}
            onArrival={closeSheet}
          />
        ) : null}
      </BottomSheetBase>
    </main>
  )
}