import { IoStar, IoStarOutline } from 'react-icons/io5'
import { DateText, Stars } from './RatingStars.styles'

export default function RatingStars({ rating = 0, date }) {
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <Stars>
      {Array.from({ length: 5 }).map((_, idx) =>
        idx < normalized ? <IoStar key={idx} size={16} /> : <IoStarOutline key={idx} size={16} />,
      )}
      {date ? <DateText>{date}</DateText> : null}
    </Stars>
  )
}
