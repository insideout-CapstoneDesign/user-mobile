import { useEffect, useMemo, useRef, useState } from 'react'
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
  PoiSearchInput,
  PoiTitle,
  PoiToggleButton,
  ReviewCard,
  ReviewCardList,
  ReviewHeader,
  ReviewMeta,
  ReviewMoreButton,
  ReviewStars,
  ReviewSummary,
  ReviewText,
  ReviewWriteButton,
  SectionBlock,
  SectionTitle,
  StickyActionSection,
  TypeContainer,
  TypeTitle,
} from './BottomSheetTypes.styles'

const POI_SEARCH_THRESHOLD = 9
const STAR_COUNT = 5

function renderStarIcons(rating = 0) {
  const filledCount = Math.max(0, Math.min(STAR_COUNT, Math.floor(rating)))

  return Array.from({ length: STAR_COUNT }).map((_, idx) =>
    idx < filledCount ? (
      <IoStar key={idx} size={13} color="var(--yellow-500)" />
    ) : (
      <IoStarOutline key={idx} size={13} color="var(--gray-400)" />
    ),
  )
}

export default function BottomSheetPlaceDetail({
  isLoggedIn = false,
  showReviewSection = true,
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
  onSelectPoi,
  reviewSummary = { rating: 0, count: 0 },
  reviews = [],
  onWriteReview,
  onMoreReviews,
}) {
  const [visibleReviewCount, setVisibleReviewCount] = useState(2)
  const [poiKeyword, setPoiKeyword] = useState('')
  const poiItemRefs = useRef({})
  const floorChipRefs = useRef({})
  const hasMoreReviews = reviews.length > visibleReviewCount
  const sortedFloors = useMemo(() => sortFloors(building.floors), [building.floors])
  const filteredByFloorPois =
    selectedFloor === null
      ? pois
      : pois.filter((poi) => Number(poi.floor) === Number(selectedFloor))
  const normalizedPoiKeyword = poiKeyword.trim().toLowerCase()
  const filteredPois = useMemo(() => {
    if (!normalizedPoiKeyword) return filteredByFloorPois

    return filteredByFloorPois.filter((poi) =>
      poi.name.toLowerCase().includes(normalizedPoiKeyword),
    )
  }, [filteredByFloorPois, normalizedPoiKeyword])
  const shouldShowPoiSearch = filteredByFloorPois.length >= POI_SEARCH_THRESHOLD
  const poiEmptyMessage = normalizedPoiKeyword
    ? '검색 결과가 없습니다.'
    : '선택한 층에 POI가 없습니다.'

  const handleMoreReviews = () => {
    setVisibleReviewCount((prev) => prev + 3)
    onMoreReviews?.()
  }

  useEffect(() => {
    if (!showPOIs || !selectedPoiId) return

    const target = poiItemRefs.current[selectedPoiId]
    target?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'center',
    })
  }, [selectedPoiId, showPOIs, filteredPois])

  useEffect(() => {
    if (selectedFloor === null) return

    const target = floorChipRefs.current[selectedFloor]
    target?.scrollIntoView?.({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedFloor, sortedFloors])

  return (
    <TypeContainer>
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

      {building.hasIndoorMap && building.floors?.length ? (
        <SectionBlock>
          <SectionTitle>층 선택</SectionTitle>
          <FloorList>
            {sortedFloors.map((floor) => (
              <FloorChip
                key={floor}
                ref={(node) => {
                  floorChipRefs.current[floor] = node
                }}
                $active={selectedFloor === floor}
                type="button"
                onClick={() => onSelectFloor?.(floor)}
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
            <PoiTitle>
              POI 목록 ({filteredByFloorPois.length}개)
            </PoiTitle>
            <span>{showPOIs ? '▲' : '▼'}</span>
          </PoiToggleButton>
          {showPOIs ? (
            <PoiList>
              {shouldShowPoiSearch ? (
                <PoiSearchInput
                  type="text"
                  value={poiKeyword}
                  onChange={(event) => setPoiKeyword(event.target.value)}
                  placeholder="POI 검색"
                  aria-label="POI 검색"
                />
              ) : null}
              {filteredPois.length > 0 ? (
                filteredPois.map((poi, idx) => (
                  <PoiItem
                    key={poi.id ?? `${poi.name}-${idx}`}
                    ref={(node) => {
                      if (!poi.id) return
                      poiItemRefs.current[poi.id] = node
                    }}
                    type="button"
                    $active={selectedPoiId === poi.id}
                    onClick={() => onSelectPoi?.(poi)}
                    aria-pressed={selectedPoiId === poi.id}
                  >
                    <PoiName>{poi.name}</PoiName>
                    <PoiFloor>{poi.floor}층</PoiFloor>
                  </PoiItem>
                ))
              ) : (
                <PoiItem type="button" disabled>
                  <PoiName>{poiEmptyMessage}</PoiName>
                </PoiItem>
              )}
            </PoiList>
          ) : null}
        </SectionBlock>
      ) : null}

      {isLoggedIn && showReviewSection ? (
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
                  <ReviewStars>{renderStarIcons(review.rating)}</ReviewStars>
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

function sortFloors(floors = []) {
  return [...floors].sort((a, b) => {
    const normalizedA = Number(a)
    const normalizedB = Number(b)

    const aIsValid = Number.isFinite(normalizedA)
    const bIsValid = Number.isFinite(normalizedB)

    if (!aIsValid && !bIsValid) return 0
    if (!aIsValid) return 1
    if (!bIsValid) return -1

    const aIsBasement = normalizedA < 0
    const bIsBasement = normalizedB < 0

    if (aIsBasement !== bIsBasement) {
      return aIsBasement ? 1 : -1
    }

    if (aIsBasement && bIsBasement) {
      return Math.abs(normalizedA) - Math.abs(normalizedB)
    }

    return normalizedA - normalizedB
  })
}
