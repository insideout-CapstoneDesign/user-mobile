import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import normalizeNavigationResponse from '../../apis/utils/normalizeNavigationResponse'
import { mockTransitNavigationResponse } from '../../mocks/navigation/transitRoute.mock'
import { createRoutingGuidanceState } from '../../utils/routing/routingGuidanceState'
import './TransitRouteTestPage.css'

const routeOrigin = {
  id: 'mock-origin',
  name: '현재 위치',
  x: 126.951744,
  y: 37.478095,
}

const routeDestination = {
  id: 'mock-destination',
  name: '디 에스테이트',
  x: 126.9822,
  y: 37.5624,
}

export default function TransitRouteTestPage() {
  const navigate = useNavigate()

  const openMockTransitRoute = () => {
    const navigationData = normalizeNavigationResponse(mockTransitNavigationResponse)
    const selectedRouteOptionId = navigationData.routeOptions[0]?.id

    navigate(ROUTES.ROUTING, {
      state: createRoutingGuidanceState({
        navigationData,
        routeDestination,
        routeOrigin,
        selectedRouteOptionId,
        transportMode: 'transit',
      }),
    })
  }

  return (
    <main className="transit-route-test-page">
      <section className="transit-route-test-page__panel">
        <h1>대중교통 경로 테스트</h1>
        <p>Tmap 호출 없이 mock 대중교통 경로로 안내 화면을 엽니다.</p>
        <button type="button" onClick={openMockTransitRoute}>
          mock 경로 열기
        </button>
      </section>
    </main>
  )
}
