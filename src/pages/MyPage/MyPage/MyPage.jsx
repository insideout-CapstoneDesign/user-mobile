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
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './MyPage.css'

export default function MyPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  useEffect(() => {
    let isMounted = true

    async function loadProfileSummary() {
      try {
        const profile = await getMyProfile()
        if (!isMounted) return
        setDisplayName(profile.displayName)
        setEmail(profile.email)
      } catch {
        if (!isMounted) return
        setDisplayName('')
        setEmail('')
      }
    }

    loadProfileSummary()

    return () => {
      isMounted = false
    }
  }, [])

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
          <strong>{displayName || email || '-'}</strong>
          <span>{email || '이메일 정보 없음'}</span>
        </div>
      </section>

      <section className="my-page__menu" aria-label="마이 메뉴">
        <MyMenuRow
          icon={IoHeartOutline}
          label="즐겨찾기"
          onClick={() => navigate('/my/favorites')}
        />
        <MyMenuRow
          icon={IoChatbubbleEllipsesOutline}
          label="내가 쓴 리뷰"
          onClick={() => navigate('/my/reviews')}
        />
        <MyMenuRow label="설정" onClick={() => navigate('/my/settings')} />
      </section>

      <div className="my-page__logout">
        <Button variant="outline">로그아웃</Button>
      </div>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
