import { useEffect, useState } from 'react'
import { IoPersonOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateMyProfile } from '../../../apis/profileApi'
import BottomNav from '../../../components/BottomNav/BottomNav'
import Button from '../../../components/Button/Button'
import CommonHeader from '../../../components/CommonHeader/CommonHeader'
import Input from '../../../components/Input/Input'
import getBottomNavRoute from '../../../utils/navigation/bottomNavRoute'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleBottomNavChange = (key) => {
    navigate(getBottomNavRoute(key))
  }

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setIsLoading(true)
      setServerError('')

      try {
        const profile = await getMyProfile()
        if (!isMounted) return

        setEmail(profile.email)
        setName(profile.displayName)
        setPhone(profile.phoneNumber)
      } catch (error) {
        if (!isMounted) return
        setServerError(error.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      const updatedProfile = await updateMyProfile({
        displayName: name.trim(),
        phoneNumber: phone.trim(),
      })
      setEmail(updatedProfile.email || email)
      setName(updatedProfile.displayName)
      setPhone(updatedProfile.phoneNumber)
      setSuccessMessage('프로필 정보가 저장되었습니다.')
    } catch (error) {
      setServerError(error.message)
    } finally {
      setIsSaving(false)
    }
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

        <form className="profile-page__form" onSubmit={handleSubmit}>
          <div className="profile-page__readonly">
            <p className="profile-page__label">이메일</p>
            <div className="profile-page__email-box">{email || '-'}</div>
            <small>이메일은 변경할 수 없습니다</small>
          </div>

          <Input
            id="profile-name"
            label="이름"
            value={name}
            maxLength={10}
            onChange={(event) => setName(event.target.value)}
            placeholder="이름을 입력하세요"
            disabled={isLoading || isSaving}
          />

          <Input
            id="profile-phone"
            label="전화번호"
            subLabel="선택"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-0000-0000"
            disabled={isLoading || isSaving}
          />

          {serverError ? (
            <p className="profile-page__status profile-page__status--error">
              {serverError}
            </p>
          ) : null}
          {successMessage ? (
            <p className="profile-page__status profile-page__status--success">
              {successMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </form>
      </section>

      <BottomNav currentKey="my" onChange={handleBottomNavChange} />
    </main>
  )
}
