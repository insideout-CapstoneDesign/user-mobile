import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import KakaoMapView from '../../components/Map/KakaoMapView'
import { ROUTES } from '../../constants/routes'
import { SEARCH_MODES } from '../../constants/search'
import { getMapViewportState } from '../../utils/map/mapViewport'
import { DEFAULT_ROUTE_ORIGIN } from '../../utils/map/navigationPlaceMapper'
import './RoutingSearchPage.css'

function getPlaceName(place, fallback) {
  return place?.title ?? place?.name ?? fallback
}

export default function RoutingSearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeOriginState = location.state?.routeOrigin ?? null
  const routeDestinationState = location.state?.routeDestination ?? null
  const selectedMapPlace = location.state?.selectedMapPlace ?? null
  const routeOrigin = routeOriginState ?? DEFAULT_ROUTE_ORIGIN
  const routeDestination = routeDestinationState ?? null
  const hasOriginValue = Boolean(
    routeOriginState && routeOriginState.source !== 'current-location',
  )
  const hasDestinationValue = Boolean(routeDestination)
  const initialMapViewport = getMapViewportState(location.state)
  const [mapCenter, setMapCenter] = useState(initialMapViewport.mapCenter)
  const [mapLevel, setMapLevel] = useState(initialMapViewport.mapLevel)

  useEffect(() => {
    if (!routeOrigin || !routeDestination) {
      return
    }

    navigate(ROUTES.ROUTING_OPTION, {
      replace: true,
      state: {
        routeOrigin,
        routeDestination,
        selectedMapPlace,
        mapCenter,
        mapLevel,
      },
    })
  }, [mapCenter, mapLevel, navigate, routeDestination, routeOrigin, selectedMapPlace])

  const originLabel = useMemo(() => {
    if (routeOrigin?.source === 'current-location') {
      return '출발지'
    }

    return getPlaceName(routeOrigin, '출발지 입력')
  }, [routeOrigin])

  const destinationLabel = useMemo(
    () => getPlaceName(routeDestination, '도착지 입력'),
    [routeDestination],
  )

  const openRouteSearch = (field) => {
    navigate(ROUTES.SEARCH, {
      state: {
        mode: SEARCH_MODES.ROUTE,
        routeField: field,
        returnTo: ROUTES.ROUTING_SEARCH,
        routeOrigin,
        routeDestination,
        selectedMapPlace,
        mapCenter,
        mapLevel,
      },
    })
  }

  const handleBottomNavChange = (key) => {
    if (key === 'map') {
      navigate(ROUTES.MAP, {
        state: {
          routeOrigin,
          routeDestination,
          mapCenter,
          mapLevel,
        },
      })
      return
    }

    if (key === 'my') {
      navigate('/my')
    }
  }

  return (
    <main className="routing-search-page">
      <div className="routing-search-page__viewport">
        <KakaoMapView
          center={mapCenter}
          level={mapLevel}
          pois={[]}
          onCenterChange={setMapCenter}
          onLevelChange={setMapLevel}
        />
      </div>

      <section
        className="routing-search-page__panel"
        aria-label="경로찾기"
      >
        <button
          type="button"
          className="routing-search-page__field"
          onClick={() => openRouteSearch('origin')}
        >
          <span
            className="routing-search-page__dot routing-search-page__dot--origin"
            aria-hidden="true"
          />
          <span
            className={`routing-search-page__field-text${
              hasOriginValue ? ' routing-search-page__field-text--filled' : ''
            }`}
          >
            {originLabel}
          </span>
        </button>

        <button
          type="button"
          className="routing-search-page__field"
          onClick={() => openRouteSearch('destination')}
        >
          <span
            className="routing-search-page__dot routing-search-page__dot--destination"
            aria-hidden="true"
          />
          <span
            className={`routing-search-page__field-text${
              hasDestinationValue ? ' routing-search-page__field-text--filled' : ''
            }`}
          >
            {destinationLabel}
          </span>
        </button>
      </section>

      <BottomNav currentKey="navigation" onChange={handleBottomNavChange} />
    </main>
  )
}
