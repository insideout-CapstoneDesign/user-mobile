import { useState } from 'react'
import BottomSheetActionBar from '../BottomSheetActionBar'
import { IoStar, IoStarOutline } from 'react-icons/io5'
import {
  ActionTitle,
  AddressText,
  FavoriteButton,
  FloorChip,
  FloorList,
  PlaceBadge,
  PlaceHead,
  PlaceHeadLeft,
  PoiFloor,
  PoiItem,
  PoiList,
  PoiName,
  PoiTitle,
  PoiToggleButton,
  ReviewCard,
  ReviewCardList,
  ReviewHeader,
  ReviewMeta,
  ReviewMoreButton,
  ReviewSummary,
  ReviewText,
  ReviewWriteButton,
  SectionBlock,
  SectionTitle,
  StickyActionSection,
  TypeContainer,
  TypeTitle,
} from './BottomSheetTypes.styles'

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
  reviewSummary = { rating: 0, count: 0 },
  reviews = [],
  onWriteReview,
  onMoreReviews,
}) {
  const [visibleReviewCount, setVisibleReviewCount] = useState(2)
  const hasMoreReviews = reviews.length > visibleReviewCount

  const handleMoreReviews = () => {
    setVisibleReviewCount((prev) => prev + 3)
    onMoreReviews?.()
  }

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }).map((_, idx) =>
      idx < rating ? (
        <IoStar key={idx} size={13} color="var(--yellow-500)" />
      ) : (
        <IoStarOutline key={idx} size={13} color="var(--gray-400)" />
      )
    )

  return (
    <TypeContainer>
      <PlaceHead>
        <PlaceHeadLeft>
          <TypeTitle>{building.name}</TypeTitle>
          {building.hasIndoorMap ? <PlaceBadge>등록됨</PlaceBadge> : null}
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

      {building.hasIndoorMap && building.floors?.length ? (
        <SectionBlock>
          <SectionTitle>층 선택</SectionTitle>
          <FloorList>
            {building.floors.map((floor) => (
              <FloorChip
                key={floor}
                type="button"
                onClick={() => onSelectFloor?.(floor)}
                style={{
                  background:
                    selectedFloor === floor ? 'var(--blue-600)' : 'var(--blue-50)',
                  color:
                    selectedFloor === floor
                      ? 'var(--text-inverse)'
                      : 'var(--blue-600)',
                }}
              >
                {floor < 0 ? `B${Math.abs(floor)}` : `${floor}`}층
              </FloorChip>
            ))}
          </FloorList>
        </SectionBlock>
      ) : null}

      {building.hasIndoorMap && pois.length > 0 ? (
        <SectionBlock>
          <PoiToggleButton type="button" onClick={onTogglePOIs}>
            <PoiTitle>POI 목록 ({pois.length}개)</PoiTitle>
            <span>{showPOIs ? '▲' : '▼'}</span>
          </PoiToggleButton>
          {showPOIs ? (
            <PoiList>
              {pois.map((poi, idx) => (
                <PoiItem key={poi.id ?? `${poi.name}-${idx}`} type="button">
                  <PoiName>{poi.name}</PoiName>
                  <PoiFloor>{poi.floor}층</PoiFloor>
                </PoiItem>
              ))}
            </PoiList>
          ) : null}
        </SectionBlock>
      ) : null}

      {isLoggedIn ? (
        <SectionBlock>
          <ReviewHeader>
            <SectionTitle style={{ marginBottom: 0 }}>리뷰</SectionTitle>
            <ReviewSummary>
              <IoStar size={14} color="var(--yellow-500)" />
              <span>{reviewSummary.rating}</span>
              <span>({reviewSummary.count})</span>
            </ReviewSummary>
          </ReviewHeader>
          <ReviewWriteButton type="button" onClick={onWriteReview}>
            리뷰 작성하기
          </ReviewWriteButton>
          <ReviewCardList>
            {reviews.slice(0, visibleReviewCount).map((review, index) => (
              <ReviewCard key={review.id ?? `${review.user}-${index}`}>
                <ReviewMeta>
                  <span style={{ display: 'inline-flex', gap: 2 }}>
                    {renderStars(review.rating)}
                  </span>
                  <span>{review.user}</span>
                </ReviewMeta>
                <ReviewText>{review.content ?? review.text}</ReviewText>
              </ReviewCard>
            ))}
            {hasMoreReviews ? (
              <ReviewMoreButton type="button" onClick={handleMoreReviews}>
                리뷰 더보기
              </ReviewMoreButton>
            ) : null}
          </ReviewCardList>
        </SectionBlock>
      ) : null}

      <StickyActionSection>
        <ActionTitle>건물 입구로 가기</ActionTitle>
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
