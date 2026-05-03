import { useState } from 'react'
import Button from '../../components/Button/Button'
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
import { mockRouteOptions } from '../../mocks/bottomSheet/routeOptions.mock'
import './ComponentTestPage.css'

export default function ComponentTestPage() {
  const [sheetType, setSheetType] = useState(null)
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
      <p className="component-test-description">
        Button/BottomSheet 공통 컴포넌트 테스트
      </p>

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
        <Button variant="outline" onClick={() => setSheetType('B')}>
          Type B 열기 (경로 선택형)
        </Button>
      </div>

      <div className="button-section">
        <Button variant="danger" onClick={() => setSheetType('C')}>
          Type C 열기 (간이 정보형)
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

        {sheetType === 'B' ? (
          <BottomSheetRouteOptions
            options={mockRouteOptions}
            onSelectOption={closeSheet}
          />
        ) : null}

        {sheetType === 'C' ? (
          <BottomSheetCompactInfo
            title="현재 위치 확인"
            description="도착지까지 약 120m 남았습니다."
          />
        ) : null}
      </BottomSheetBase>
    </main>
  )
}
