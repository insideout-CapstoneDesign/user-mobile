import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Button from '../../../components/Button/Button'
import CommonHeader from '../../../components/CommonHeader/CommonHeader'
import MyMenuRow from '../../../components/My/MyMenuRow'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './SettingsPage.css'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  return (
    <main className="settings-page">
      <CommonHeader variant="title" title="설정" onBack={() => navigate('/my')} />

      <section className="settings-page__section" aria-label="계정 관리">
        <p>계정 관리</p>

        <div className="settings-page__menu">
          <MyMenuRow label="프로필 정보" onClick={() => navigate('/my/profile')} />
          <MyMenuRow label="비밀번호 변경" onClick={() => navigate('/my/password')} />
          <MyMenuRow
            label="회원 탈퇴"
            danger
            onClick={() => setIsWithdrawModalOpen(true)}
          />
        </div>
      </section>

      {isWithdrawModalOpen ? (
        <div className="withdraw-modal" role="dialog" aria-modal="true">
          <div className="withdraw-modal__backdrop" onClick={() => setIsWithdrawModalOpen(false)} />
          <div className="withdraw-modal__content">
            <h2>회원 탈퇴</h2>
            <p>
              정말 탈퇴하시겠습니까?
              <br />
              모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>

            <div className="withdraw-modal__actions">
              <div>
                <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
                  취소
                </Button>
              </div>
              <div>
                <Button variant="danger">탈퇴하기</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
