import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SplashPage.css'

const LOGO_SWITCH_DELAY_MS = 900
const NAVIGATE_DELAY_MS = 1800

export default function SplashPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('logo1')
  const logoSrc = phase === 'logo1' ? '/logo1.svg' : '/logo2.svg'

  useEffect(() => {
    const logoSwitchTimer = window.setTimeout(() => {
      setPhase('logo2')
    }, LOGO_SWITCH_DELAY_MS)

    const navigateTimer = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, NAVIGATE_DELAY_MS)

    return () => {
      window.clearTimeout(logoSwitchTimer)
      window.clearTimeout(navigateTimer)
    }
  }, [navigate])

  return (
    <main className={`splash-page splash-page--${phase}`}>
      <div className="splash-page__logo-frame">
        <img className="splash-page__logo" src={logoSrc} alt="insideout" />
      </div>
    </main>
  )
}
