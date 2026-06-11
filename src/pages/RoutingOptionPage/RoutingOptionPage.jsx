import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetRouteOptions from '../../components/BottomSheet/types/BottomSheetRouteOptions'
import DirectionSearch from '../../components/Direction/DirectionSearch'
import KakaoMapView from '../../components/Map/KakaoMapView'
import TransportSelector from '../../components/Transport/TransportSelector'
import {
  ROUTE_OPTION_CONTENT_MAX_HEIGHT,
  ROUTE_OPTION_INITIAL_SNAP,
  ROUTING_OPTION_PAGE_SNAP_POINTS,
} from '../../constants/routeOptionSheet'
import { ROUTES } from '../../constants/routes'
import { SEARCH_MODES } from '../../constants/search'
import useNavigationRoute from '../../hooks/useNavigationRoute'
import {
  DEFAULT_ROUTE_ORIGIN,
  toNavigationPlace,
  toNavigationRequestInput,
} from '../../utils/map/navigationPlaceMapper'
import {
  getIndoorFloorplan,
  getOutdoorRouteLegs,
  isIndoorOnlyRouteOption,
} from '../../utils/map/routeOverlayMappers'
import { createRoutingGuidanceState } from '../../utils/routing/routingGuidanceState'
import FloorplanRouteView from '../../components/Map/FloorplanRouteView'
import './RoutingOptionPage.css'

export default function RoutingOptionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [transportMode, setTransportMode] = useState(
    () => location.state?.transportMode ?? 'walk',
  )
  const navigationRoute = useNavigationRoute()
  const { requestRoute } = navigationRoute

  const routeOrigin = useMemo(
    () => toNavigationPlace(location.state?.routeOrigin, 'origin') ?? DEFAULT_ROUTE_ORIGIN,
    [location.state?.routeOrigin],
  )
  const routeDestination = useMemo(
    () => toNavigationPlace(location.state?.routeDestination, 'destination'),
    [location.state?.routeDestination],
  )
  const mapCenter = location.state?.mapCenter ?? {
    lat: routeDestination?.y ?? routeOrigin.y,
    lng: routeDestination?.x ?? routeOrigin.x,
  }
  const mapLevel = location.state?.mapLevel ?? 3
  const hasRoutePlaces = Boolean(routeOrigin && routeDestination)
  const selectedRouteOption = navigationRoute.selectedRouteOption
  const outdoorRouteLegs = useMemo(
    () => getOutdoorRouteLegs(selectedRouteOption),
    [selectedRouteOption],
  )
  const selectedFloorplan = getIndoorFloorplan(selectedRouteOption)
  const shouldShowFloorplanRoute =
    transportMode !== 'transit' &&
    isIndoorOnlyRouteOption(selectedRouteOption) &&
    Boolean(selectedFloorplan?.mapImageUrl)

  useEffect(() => {
    if (!hasRoutePlaces) {
      return
    }

    requestRoute(
      toNavigationRequestInput({
        origin: routeOrigin,
        destination: routeDestination,
        transportMode,
        includeIndoor: true,
      }),
    ).catch(() => {})
  }, [hasRoutePlaces, requestRoute, routeDestination, routeOrigin, transportMode])

  const handleBack = () => {
    navigate(ROUTES.ROUTING_SEARCH, { replace: true })
  }

  const openRouteSearch = (field) => {
    navigate(ROUTES.SEARCH, {
      state: {
        mode: SEARCH_MODES.ROUTE,
        routeField: field,
        returnTo: ROUTES.ROUTING_OPTION,
        routeOrigin,
        routeDestination,
        mapCenter,
        mapLevel,
      },
    })
  }

  const handleSwap = () => {
    if (!routeDestination) {
      return
    }

    navigate(ROUTES.ROUTING_OPTION, {
      replace: true,
      state: {
        routeOrigin: routeDestination,
        routeDestination: routeOrigin,
        mapCenter,
        mapLevel,
      },
    })
  }

  const handleStartNavigation = (option) => {
    if (!navigationRoute.data || !option) {
      return
    }

    navigate(ROUTES.ROUTING, {
      state: createRoutingGuidanceState({
        navigationData: navigationRoute.data,
        routeDestination,
        routeOrigin,
        selectedRouteOptionId: option.id,
        transportMode,
      }),
    })
  }

  if (!hasRoutePlaces) {
    return (
      <main className="routing-option-page">
        <div className="routing-option-page__viewport">
          <KakaoMapView center={mapCenter} level={mapLevel} pois={[]} />
        </div>
        <div className="routing-option-page__state routing-option-page__state--error">
          출발지와 도착지를 다시 선택해 주세요.
        </div>
      </main>
    )
  }

  return (
    <main className="routing-option-page">
      <div className="routing-option-page__viewport">
        {shouldShowFloorplanRoute ? (
          <FloorplanRouteView
            floorplan={selectedFloorplan}
            showInstructionBadge={false}
          />
        ) : (
          <KakaoMapView
            center={mapCenter}
            level={mapLevel}
            pois={[]}
            routeLegs={outdoorRouteLegs}
            fitRouteBounds={outdoorRouteLegs.length > 0}
          />
        )}
      </div>

      <div className="routing-option-page__direction">
        <DirectionSearch
          origin={routeOrigin.name}
          destination={routeDestination.name}
          onSwap={handleSwap}
          onBack={handleBack}
          onOriginClick={() => openRouteSearch('origin')}
          onDestinationClick={() => openRouteSearch('destination')}
        />
      </div>

      <div className="routing-option-page__transport">
        <TransportSelector
          activeMode={transportMode}
          onSelect={setTransportMode}
        />
      </div>

      {navigationRoute.isLoading ? (
        <div className="routing-option-page__state">경로를 찾는 중</div>
      ) : null}

      {navigationRoute.isError ? (
        <div className="routing-option-page__state routing-option-page__state--error">
          {navigationRoute.hasNavigationNotFound
            ? '경로를 찾을 수 없습니다.'
            : navigationRoute.error?.message}
        </div>
      ) : null}

      <BottomSheetBase
        isOpen
        onClose={() => {}}
        showBackdrop={false}
        detent="content"
        snapPoints={ROUTING_OPTION_PAGE_SNAP_POINTS}
        initialSnap={ROUTE_OPTION_INITIAL_SNAP}
        dismissible={false}
        scrollableContent={false}
        contentMaxHeight={ROUTE_OPTION_CONTENT_MAX_HEIGHT}
      >
        <BottomSheetRouteOptions
          mode={transportMode}
          options={navigationRoute.routeOptions}
          selectedOptionId={navigationRoute.selectedRouteOptionId}
          onSelectOption={navigationRoute.selectRouteOption}
          onStartNavigation={handleStartNavigation}
          maxHeight={ROUTE_OPTION_CONTENT_MAX_HEIGHT}
        />
      </BottomSheetBase>
    </main>
  )
}
