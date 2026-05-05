import { useState } from 'react'
import Button from '../../components/Button/Button'
import SearchInput from '../../components/SearchInput/SearchInput'
import BottomNav from '../../components/BottomNav/BottomNav'
import CommonHeader from '../../components/CommonHeader/CommonHeader'
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
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentNav, setCurrentNav] = useState('map')
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPOIs, setShowPOIs] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(null)

  const closeSheet = () => {
    setSheetType(null)
    setShowPOIs(false)
  }

  return (
    <main className="component-test-page">
      <h1>insideout</h1>
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
          Type A 열기 (로그인)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('A_GUEST')}>
          Type A 열기 (비로그인)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('B_WALK')}>
          Type B 열기 (도보)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('B_TRANSIT')}>
          Type B 열기 (대중교통)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="outline" onClick={() => setSheetType('B_CAR')}>
          Type B 열기 (자동차)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="danger" onClick={() => setSheetType('C')}>
          Type C 열기 (간이 정보형)
        </Button>
      </div>

      <p className="component-test-description">현재 선택: {currentNav}</p>

      <BottomNav currentKey={currentNav} onChange={setCurrentNav} />

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
