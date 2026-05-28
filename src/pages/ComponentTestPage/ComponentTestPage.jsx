import { useState } from 'react'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import DirectionSearch from '../../components/Direction/DirectionSearch'
import TransportSelector from '../../components/Transport/TransportSelector'
import FloorSelector from '../../components/Floor/FloorSelector'
import SearchResultItem from '../../components/Search/SearchResultItem'
import SearchInput from '../../components/SearchInput/SearchInput'
import BottomNav from '../../components/BottomNav/BottomNav'
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../../components/BottomSheet/types/BottomSheetCompactInfo'
import BottomSheetPlaceDetail from '../../components/BottomSheet/types/BottomSheetPlaceDetail'
import BottomSheetRouteOptions from '../../components/BottomSheet/types/BottomSheetRouteOptions'
import NavigationMapOverlay from '../../components/NavigationGuidance/NavigationMapOverlay'
import TransitTurnByTurnList from '../../components/NavigationGuidance/TransitTurnByTurnList'
import TurnByTurnList from '../../components/NavigationGuidance/TurnByTurnList'

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

const mockGuidanceSteps = [
  {
    id: 'guidance-origin',
    type: 'walk',
    instruction: '현재 위치',
  },
  {
    id: 'guidance-straight',
    type: 'walk',
    instruction: '202m 이동',
    distanceText: '202m',
  },
  {
    id: 'guidance-left',
    type: 'walk',
    instruction: '왼쪽 길로 39m 이동',
    distanceText: '39m',
  },
  {
    id: 'guidance-stairs',
    type: 'indoor',
    instruction: '계단 이용',
    floorName: '공학관 5F',
  },
  {
    id: 'guidance-crosswalk',
    type: 'walk',
    instruction: '소망 메디컬 약국 까지 횡단보도 이용',
  },
  {
    id: 'guidance-destination',
    type: 'indoor',
    instruction: '601호 강의실 도착',
    floorName: '공학관 6F',
  },
]

const mockTransitDetailRoute = {
  name: '최단거리',
  time: '27분',
  segments: [
    { type: 'walk', minutes: 2 },
    {
      type: 'subway',
      line: '2',
      minutes: 3,
      routeColor: '00A835',
      routeId: '2',
      routeNm: '서울2호선',
      typeCode: '1',
    },
    { type: 'walk', minutes: 4 },
    {
      type: 'subway',
      line: '3',
      minutes: 17,
      routeColor: 'EF7C1C',
      routeId: '3',
      routeNm: '서울3호선',
      typeCode: '1',
    },
    { type: 'walk', minutes: 1 },
  ],
}

const mockTransitDetailLegs = [
  {
    id: 'transit-start',
    type: 'point',
    tone: 'origin',
    title: '강남역',
    detail: '서울 강남구 강남대로 지하 396',
  },
  {
    id: 'transit-walk-1',
    type: 'walk',
    title: '도보 120m (2분)',
    detail: '강남역 10번 출구 방면',
  },
  {
    id: 'transit-subway-2',
    type: 'subway',
    routeColor: '00A835',
    line: '서울2호선',
    startName: '강남역',
    startDetail: '외선순환 방면',
    stopCount: 1,
    durationText: '3분',
    stops: ['역삼역'],
    endName: '교대역',
    endDetail: '3호선 환승',
  },
  {
    id: 'transit-walk-2',
    type: 'walk',
    title: '3호선 환승 도보 210m (4분)',
    detail: '3호선 승강장으로 이동',
  },
  {
    id: 'transit-subway-3',
    type: 'subway',
    routeColor: 'EF7C1C',
    line: '서울3호선',
    startName: '교대역',
    startDetail: '대화 방면',
    stopCount: 6,
    durationText: '17분',
    stops: ['고속터미널역', '잠원역', '신사역', '압구정역', '옥수역', '동대입구역'],
    endName: '충무로역',
    endDetail: '내리는 문 왼쪽',
  },
  {
    id: 'transit-walk-3',
    type: 'walk',
    title: '도보 80m (1분)',
    detail: '충무로역 6번 출구 방면',
  },
  {
    id: 'transit-destination',
    type: 'point',
    tone: 'destination',
    title: '충무로역',
    detail: '서울 중구 퇴계로 지하 214',
  },
]

export default function ComponentTestPage() {
  const [sheetType, setSheetType] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentNav, setCurrentNav] = useState('map')
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPOIs, setShowPOIs] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(null)
  
  const [testName, setTestName] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testPassword, setTestPassword] = useState('')
  const [testPhone, setTestPhone] = useState('')

  const [origin, setOrigin] = useState('공학관 601호')
  const [destination, setDestination] = useState('충무로 4호선 1번출구')
  const [transport, setTransport] = useState('transit')
  const [guidancePreview, setGuidancePreview] = useState('walkList')
  const [activeGuidanceIndex, setActiveGuidanceIndex] = useState(2)

const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength > 11) return value.substring(0, 13); 

  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 8) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
};

const handlePhoneChange = (e) => {
  const formattedValue = formatPhoneNumber(e.target.value);
  setTestPhone(formattedValue); 
};
  

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
    <main className="component-test-page">
      <h1>insideout</h1>
      <p className="component-test-description">
        컴포넌트 및 디자인 시스템 통합 테스트
      </p>
      <div className="header-demo-list">
        <div className="header-demo-frame">
          <CommonHeader
            variant="title"
            title="즐겨찾기"
            onBack={() => {}}
            overlay
          />
        </div>
        <div className="header-demo-frame">
          <CommonHeader
            variant="search"
            onBack={() => {}}
            overlay
            searchProps={{
              value: searchKeyword,
              onChange: setSearchKeyword,
              placeholder: '건물, 장소 검색',
            }}
          />
        </div>
        <div className="header-demo-frame">
          <CommonHeader
            variant="menu"
            title="공학관1층"
            onBack={() => {}}
            onMenuClick={() => {}}
            overlay
          />
        </div>
        <div className="header-demo-frame">
          <CommonHeader
            variant="routeInfo"
            onBack={() => {}}
            onClose={() => {}}
            origin="공학관"
            destination="학생회관"
            onRouteClick={() => {}}
            overlay
          />
        </div>
      </div>

      <p className="component-section-title">SearchInput 공통 컴포넌트 테스트</p>
      <div className="button-section">
        <SearchInput
          value={searchKeyword}
          onChange={setSearchKeyword}
          onSearch={() => setSheetType('A_GUEST')}
        />
      </div>

      <section className="component-demo-section">
        {mockSearchResults.map((item) => (
          <SearchResultItem 
            key={item.id}
            title={item.title}
            address={item.address}
            isRegistered={item.isRegistered}
            onClick={() => setSearchKeyword(item.title)}
          />
        ))}
      </section>
      
      <FloorSelector 
        buildingName={mockBuilding.name}
        floors={mockFloorList} 
        activeFloor={selectedFloor} 
        onSelect={setSelectedFloor} 
      />

      <DirectionSearch 
        origin={origin}
        destination={destination}
        onSwap={handleSwap}
        onBack={() => setCurrentNav('map')} 
      />

      <section className="component-demo-section">
        <Input 
          label="이름" 
          type="text"
          placeholder="이름을 입력해주세요" 
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
        />
        <Input 
          label="이메일" 
          type="email"
          placeholder="example@email.com" 
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        <Input 
          label="비밀번호" 
          type="password" 
          placeholder="8자 이상 입력" 
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
        />
        <Input 
          label="전화번호" 
          subLabel="선택" 
          type="tel"
          placeholder="010-0000-0000" 
          value={testPhone}
          onChange={handlePhoneChange}
        />
      </section>

      <TransportSelector 
        activeMode={transport} 
        onSelect={setTransport} 
      />

      <section className="button-group component-demo-section component-demo-section--padded">
        <Button variant="outline">로그아웃</Button>
        <Button variant="primary">저장</Button>
        <Button disabled>저장 (비활성화)</Button>
        
        <div className="button-row two-col component-demo-button-row">
          <Button variant="outline">출발</Button>
          <Button variant="primary">도착</Button>
        </div>
      </section>

      <section className="component-demo-actions">
        <Button variant="primary" onClick={() => setSheetType('A_AUTH')}>장소 상세 (로그인)</Button>
        <Button variant="outline" onClick={() => setSheetType('B_TRANSIT')}>경로 정보 상세</Button>
        <Button variant="danger" onClick={() => setSheetType('C')}>간이 정보 (Type C)</Button>
      </section>

      <p className="component-test-description">현재 선택: {currentNav}</p>

      <p className="component-section-title">턴바이턴 안내 UI</p>
      <div className="guidance-preview-tabs">
        <button
          type="button"
          className={guidancePreview === 'walkList' ? 'active' : ''}
          onClick={() => setGuidancePreview('walkList')}
        >
          도보/자동차
        </button>
        <button
          type="button"
          className={guidancePreview === 'transitList' ? 'active' : ''}
          onClick={() => setGuidancePreview('transitList')}
        >
          대중교통
        </button>
        <button
          type="button"
          className={guidancePreview === 'map' ? 'active' : ''}
          onClick={() => setGuidancePreview('map')}
        >
          지도 오버레이
        </button>
      </div>

      <section className="guidance-preview-frame">
        {guidancePreview === 'walkList' ? (
          <TurnByTurnList
            origin="현재 위치"
            destination="공학관 601호"
            route={{ time: '20분', distance: '1km', extraInfo: '계단 1회' }}
            steps={mockGuidanceSteps}
            activeStepId={mockGuidanceSteps[activeGuidanceIndex]?.id}
            onBack={() => setGuidancePreview('map')}
            onClose={() => {}}
            onSelectStep={(_, index) => {
              setActiveGuidanceIndex(index)
              setGuidancePreview('map')
            }}
          />
        ) : guidancePreview === 'transitList' ? (
          <TransitTurnByTurnList
            origin="강남역"
            destination="충무로역"
            route={mockTransitDetailRoute}
            legs={mockTransitDetailLegs}
            onBack={() => setGuidancePreview('map')}
            onClose={() => {}}
          />
        ) : (
          <>
            <div className="guidance-preview-map">
              <span>지도 또는 실내 도면 영역</span>
              <svg viewBox="0 0 240 420" aria-hidden="true">
                <polyline points="68,312 68,188 168,188 168,104" />
              </svg>
            </div>
            <NavigationMapOverlay
              origin="현재 위치"
              destination="공학관 601호"
              step={mockGuidanceSteps[activeGuidanceIndex]}
              activeIndex={activeGuidanceIndex}
              total={mockGuidanceSteps.length}
              onBack={() => setGuidancePreview('walkList')}
              onClose={() => {}}
              onRouteClick={() => setGuidancePreview('walkList')}
              onPrevious={() => setActiveGuidanceIndex((index) => Math.max(index - 1, 0))}
              onNext={() =>
                setActiveGuidanceIndex((index) =>
                  Math.min(index + 1, mockGuidanceSteps.length - 1),
                )
              }
            />
            <div className="guidance-preview-floor">
              <FloorSelector
                buildingName="공학관"
                floors={mockFloorList}
                activeFloor={selectedFloor}
                onSelect={setSelectedFloor}
              />
            </div>
          </>
        )}
      </section>

      {guidancePreview !== 'map' ? (
        <BottomNav currentKey={currentNav} onChange={setCurrentNav} />
      ) : null}

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
             mode={transport}
             options={
               transport === 'car'
               ? mockCarRouteOptions
               : transport === 'walk'
               ? mockWalkRouteOptions
               : mockTransitRouteOptions
              }
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
