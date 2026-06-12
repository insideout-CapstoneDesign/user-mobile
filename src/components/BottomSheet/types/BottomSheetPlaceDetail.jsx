import { IoStar, IoStarOutline } from 'react-icons/io5'
import BottomSheetActionBar from '../BottomSheetActionBar'
import {
  ActionTitle,
  AddressText,
  FavoriteButton,
  PlaceBadge,
  PlaceHead,
  PlaceHeadLeft,
  SectionBlock,
  StickyActionSection,
  TypeContainer,
  TypeTitle,
} from './BottomSheetTypes.styles'
import BottomSheetPlaceDetailIndoorSection from './BottomSheetPlaceDetailIndoorSection'
import BottomSheetPlaceDetailReviewSection from './BottomSheetPlaceDetailReviewSection'

export default function BottomSheetPlaceDetail({
  isLoggedIn = false,
  building = {
    name: '장소명',
    address: '주소 정보',
    hasIndoorMap: false,
    floors: [],
  },
  isFavorite = false,
  onToggleFavorite,
  onSelectFloor,
  selectedFloor = null,
  onDeparture,
  onArrival,
  pois = [],
  showPOIs = false,
  onTogglePOIs,
  selectedPoiId = null,
  selectedPoiName = null,
  onSelectPoi,
  reviewSummary = { rating: 0, count: 0 },
  reviews = [],
  onWriteReview,
  onMoreReviews,
}) {
  return (
    <TypeContainer $scrollLayout>
      <SectionBlock style={{ borderTop: 'none', paddingTop: 0 }}>
        <PlaceHead>
          <PlaceHeadLeft>
            <TypeTitle>{building.name}</TypeTitle>
            {building.isRegistered ? <PlaceBadge>등록됨</PlaceBadge> : null}
          </PlaceHeadLeft>

          {isLoggedIn ? (
            <FavoriteButton
              type="button"
              onClick={onToggleFavorite}
              $active={isFavorite}
              aria-label="즐겨찾기"
            >
              {isFavorite ? <IoStar size={22} /> : <IoStarOutline size={22} />}
            </FavoriteButton>
          ) : null}
        </PlaceHead>

        <AddressText>{building.address}</AddressText>
      </SectionBlock>

      <BottomSheetPlaceDetailIndoorSection
        building={building}
        pois={pois}
        selectedFloor={selectedFloor}
        onSelectFloor={onSelectFloor}
        showPOIs={showPOIs}
        onTogglePOIs={onTogglePOIs}
        selectedPoiId={selectedPoiId}
        onSelectPoi={onSelectPoi}
      />

      <BottomSheetPlaceDetailReviewSection
        isVisible={isLoggedIn}
        reviewSummary={reviewSummary}
        reviews={reviews}
        onWriteReview={onWriteReview}
        onMoreReviews={onMoreReviews}
      />

      <StickyActionSection $sticky={false}>
        <ActionTitle>
          {selectedPoiName ? `${selectedPoiName}로 가기` : '건물 입구로 가기'}
        </ActionTitle>
        <BottomSheetActionBar
          leftLabel="출발"
          rightLabel="도착"
          leftVariant="outline"
          rightVariant="primary"
          onLeftClick={onDeparture}
          onRightClick={onArrival}
        />
      </StickyActionSection>
    </TypeContainer>
  )
}
