import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import CommonHeader from '../../../components/CommonHeader/CommonHeader'
import RatingStars from '../../../components/My/RatingStars'
import { mockMyReviews } from '../../../mocks/my/myPage.mock'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './ReviewsPage.css'

export default function ReviewsPage() {
  const navigate = useNavigate()

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  return (
    <main className="reviews-page">
      <CommonHeader variant="title" title="내가 쓴 리뷰" onBack={() => navigate('/my')} />

      <section className="reviews-page__list" aria-label="내가 쓴 리뷰 목록">
        {mockMyReviews.map((review) => (
          <article key={review.id} className="review-item">
            <div className="review-item__header">
              <strong>{review.placeName}</strong>
              <button type="button">삭제</button>
            </div>

            <RatingStars rating={review.rating} date={review.date} />

            <p>{review.content}</p>
          </article>
        ))}
      </section>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
