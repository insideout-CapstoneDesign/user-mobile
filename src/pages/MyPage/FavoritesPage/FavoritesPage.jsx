import { useNavigate } from 'react-router-dom'
import { IoChevronForward, IoStar } from 'react-icons/io5'
import BottomNav from '../../../components/BottomNav/BottomNav'
import CommonHeader from '../../../components/CommonHeader/CommonHeader'
import { mockFavorites } from '../../../mocks/my/myPage.mock'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './FavoritesPage.css'

export default function FavoritesPage() {
  const navigate = useNavigate()

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  return (
    <main className="favorites-page">
      <CommonHeader variant="title" title="즐겨찾기" onBack={() => navigate('/my')} />

      <section className="favorites-page__list" aria-label="즐겨찾기 목록">
        {mockFavorites.map((item) => (
          <button key={item.id} type="button" className="favorite-item">
            <div className="favorite-item__content">
              <div className="favorite-item__title-row">
                <strong>{item.name}</strong>
                {item.isRegistered ? <span>등록됨</span> : null}
              </div>
              <p>{item.address}</p>
            </div>

            <div className="favorite-item__right">
              <IoStar size={18} />
              <IoChevronForward size={20} />
            </div>
          </button>
        ))}
      </section>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
