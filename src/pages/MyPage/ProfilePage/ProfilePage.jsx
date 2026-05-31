import { useState } from 'react'
import { IoPersonOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Button from '../../../components/Button/Button'
import CommonHeader from '../../../components/CommonHeader/CommonHeader'
import Input from '../../../components/Input/Input'
import { mockMyProfile } from '../../../mocks/my/myPage.mock'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [name, setName] = useState(mockMyProfile.name)
  const [phone, setPhone] = useState(mockMyProfile.phone)

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  return (
    <main className="profile-page">
      <CommonHeader
        variant="title"
        title="프로필 정보"
        onBack={() => navigate('/my/settings')}
      />

      <section className="profile-page__content">
        <div className="profile-page__avatar" aria-hidden="true">
          <IoPersonOutline size={48} />
        </div>

        <div className="profile-page__form">
          <div className="profile-page__readonly">
            <p className="profile-page__label">이메일</p>
            <div className="profile-page__email-box">{mockMyProfile.email}</div>
            <small>이메일은 변경할 수 없습니다</small>
          </div>

          <Input
            id="profile-name"
            label="이름"
            value={name}
            maxLength={10}
            onChange={(event) => setName(event.target.value)}
            placeholder="이름을 입력하세요"
          />

          <Input
            id="profile-phone"
            label="전화번호"
            subLabel="선택"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-0000-0000"
          />

          <Button>저장</Button>
        </div>
      </section>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
