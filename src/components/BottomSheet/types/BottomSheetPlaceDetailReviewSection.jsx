import { useState } from 'react'
import { IoStar, IoStarOutline } from 'react-icons/io5'
import {
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
} from './BottomSheetTypes.styles'

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

export default function BottomSheetPlaceDetailReviewSection({
  isVisible = false,
  reviewSummary = { rating: 0, count: 0 },
  reviews = [],
  onWriteReview,
  onMoreReviews,
}) {
  const [visibleReviewCount, setVisibleReviewCount] = useState(2)

  if (!isVisible) return null

  const hasMoreReviews = reviews.length > visibleReviewCount

  const handleMoreReviews = () => {
    setVisibleReviewCount((prev) => prev + 3)
    onMoreReviews?.()
  }

  return (
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
  )
}
