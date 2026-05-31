import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Button from '../../../components/Button/Button'
import CommonHeader from '../../../components/CommonHeader/CommonHeader'
import Input from '../../../components/Input/Input'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './PasswordPage.css'

export default function PasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  return (
    <main className="password-page">
      <CommonHeader
        variant="title"
        title="비밀번호 변경"
        onBack={() => navigate('/my/settings')}
      />

      <section className="password-page__content">
        <div className="password-page__form">
          <Input
            id="current-password"
            type="password"
            label="현재 비밀번호"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="현재 비밀번호 입력"
          />

          <Input
            id="new-password"
            type="password"
            label="새 비밀번호"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="새 비밀번호 입력 (8자 이상)"
          />

          <Input
            id="confirm-password"
            type="password"
            label="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="새 비밀번호 재입력"
          />

          <Button>변경하기</Button>
        </div>

        <div className="password-page__hint">
          비밀번호는 영문 대소문자, 숫자, 특수문자를 포함해 8자 이상으로 설정해 주세요.
        </div>
      </section>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
