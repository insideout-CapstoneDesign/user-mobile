import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoChatbubbleEllipsesOutline,
  IoHeartOutline,
  IoPersonOutline,
} from 'react-icons/io5'
import { getMyProfile } from '../../../apis/profileApi'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Button from '../../../components/Button/Button'
import MyMenuRow from '../../../components/My/MyMenuRow'
import { AUTH_STORAGE_KEY } from '../../../constants/auth'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './MyPage.css'

export default function MyPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  useEffect(() => {
    let isMounted = true

    async function loadProfileSummary() {
      const token = localStorage.getItem(AUTH_STORAGE_KEY.ACCESS_TOKEN)

      if (!token) {
        if (!isMounted) return
        setIsLoggedIn(false)
        setDisplayName('')
        setEmail('')
        return
      }

      try {
        const profile = await getMyProfile()
        if (!isMounted) return
        setIsLoggedIn(true)
        setDisplayName(profile.displayName)
        setEmail(profile.email)
      } catch {
        if (!isMounted) return
        setIsLoggedIn(false)
        setDisplayName('')
        setEmail('')
      }
    }

    loadProfileSummary()

    return () => {
      isMounted = false
    }
  }, [])

  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    navigate(path)
  }

  const handleAuthAction = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    localStorage.removeItem(AUTH_STORAGE_KEY.ACCESS_TOKEN)
    setIsLoggedIn(false)
    setDisplayName('')
    setEmail('')
    navigate('/login', { replace: true })
  }

  return (
    <main className="my-page">
      <header className="my-page__header">
        <h1>마이페이지</h1>
      </header>

      <section className="my-page__profile" aria-label="프로필 요약">
        <div className="my-page__avatar">
          <IoPersonOutline size={32} />
        </div>
        <div className="my-page__profile-text">
          <strong>{isLoggedIn ? displayName || email : '로그인이 필요해요'}</strong>
          <span>
            {isLoggedIn
              ? email || '이메일 정보 없음'
              : '로그인하면 즐겨찾기/리뷰를 확인할 수 있어요.'}
          </span>
        </div>
      </section>

      <section className="my-page__menu" aria-label="마이 메뉴">
        <MyMenuRow
          icon={IoHeartOutline}
          label="즐겨찾기"
          onClick={() => handleProtectedNavigation('/my/favorites')}
        />
        <MyMenuRow
          icon={IoChatbubbleEllipsesOutline}
          label="내가 쓴 리뷰"
          onClick={() => handleProtectedNavigation('/my/reviews')}
        />
        <MyMenuRow label="설정" onClick={() => handleProtectedNavigation('/my/settings')} />
      </section>

      <div className="my-page__logout">
        <Button variant="outline" onClick={handleAuthAction}>
          {isLoggedIn ? '로그아웃' : '로그인'}
        </Button>
      </div>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
