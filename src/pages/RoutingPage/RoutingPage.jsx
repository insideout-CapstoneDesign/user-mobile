import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetRouteOptions from '../../components/BottomSheet/types/BottomSheetRouteOptions'
import FloorplanRouteView from '../../components/Map/FloorplanRouteView'
import KakaoMapView from '../../components/Map/KakaoMapView'
import MapPoiSheet from '../../components/Map/MapPoiSheet'
import SearchInput from '../../components/SearchInput/SearchInput'
import { ROUTES } from '../../constants/routes'
import { mockMapPois } from '../../mocks/map/poi.mock'
import { mapSearchPlaceToPoi } from '../../utils/map/mapPoiMappers'
import { getOutdoorRouteLegs } from '../../utils/map/routeOverlayMappers'
import { getRoutingGuidanceState } from '../../utils/routing/routingGuidanceState'
import RoutingGuidanceLayer from './components/RoutingGuidanceLayer'
import RoutingOptionLayer from './components/RoutingOptionLayer'
import useRoutingController from './useRoutingController'
import './RoutingPage.css'

const ROUTE_OPTION_SNAP_POINTS = [0, 96, 1]
const ROUTE_OPTION_INITIAL_SNAP = 2
const ROUTE_OPTION_CONTENT_MAX_HEIGHT = 'calc(58dvh - 40px)'

export default function RoutingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSearchPlace = location.state?.selectedSearchPlace ?? null
  const selectedMapPlace = location.state?.selectedMapPlace ?? null
  const routingGuidanceState = getRoutingGuidanceState(location.state)
  const [selectedPoi, setSelectedPoi] = useState(() =>
    mapSearchPlaceToPoi(selectedSearchPlace ?? selectedMapPlace),
  )
  const routing = useRoutingController(
    routingGuidanceState
      ? {
          initialCurrentNav: 'navigation',
          initialGuidanceStarted: true,
          initialNavigationData: routingGuidanceState.navigationData,
          initialRouteDestination: routingGuidanceState.routeDestination,
          initialRouteOrigin: routingGuidanceState.routeOrigin,
          initialSelectedRouteOptionId: routingGuidanceState.selectedRouteOptionId,
          initialTransportMode: routingGuidanceState.transportMode,
        }
      : undefined,
  )
  const {
    currentNav,
    guidanceStarted,
    isIndoorGuidanceStep,
    isRouteMode,
    navigationRoute,
    routeDestination,
    routeOrigin,
    routeSheetOpen,
    transportMode,
  } = routing
  const isSelectedPoiRegistered = Boolean(selectedPoi?.isRegistered)
  const outdoorRouteLegs = useMemo(
    () => getOutdoorRouteLegs(navigationRoute.selectedRouteOption),
    [navigationRoute.selectedRouteOption],
  )
  const shouldShowIndoorRoute =
    guidanceStarted && isIndoorGuidanceStep && navigationRoute.selectedFloorplan

  useEffect(() => {
    setSelectedPoi(mapSearchPlaceToPoi(selectedSearchPlace ?? selectedMapPlace))
  }, [selectedMapPlace, selectedSearchPlace])

  const closePoiSheet = () => {
    setSelectedPoi(null)
  }

  const openSearchPage = () => {
    navigate('/search')
  }

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSearchPage()
    }
  }

  const openRouteOptions = () => {
    navigate(ROUTES.ROUTING_OPTION, {
      state: {
        routeOrigin,
        routeDestination,
        transportMode,
      },
    })
  }

  return (
    <main className="routing-page">
      <div className="routing-page__viewport">
        {shouldShowIndoorRoute ? (
          <FloorplanRouteView
            floorplan={navigationRoute.selectedFloorplan}
            activeStep={routing.activeGuidanceStep}
            showInstructionBadge={false}
          />
        ) : (
          <KakaoMapView
            pois={mockMapPois}
            onPoiSelect={setSelectedPoi}
            routeLegs={outdoorRouteLegs}
            activeRouteStep={routing.activeGuidanceStep}
            fitRouteBounds={outdoorRouteLegs.length > 0}
          />
        )}
      </div>

      {guidanceStarted ? (
        <RoutingGuidanceLayer
          routing={routing}
          onBackToRouteOptions={openRouteOptions}
        />
      ) : null}

      {!guidanceStarted && isRouteMode ? <RoutingOptionLayer routing={routing} /> : null}

      {!guidanceStarted && !isRouteMode ? (
        <div className="routing-page__search">
          <SearchInput
            value=""
            placeholder="건물, 장소 검색"
            readOnly
            onClick={openSearchPage}
            onKeyDown={handleSearchInputKeyDown}
          />
        </div>
      ) : null}

      {navigationRoute.isLoading ? (
        <div className="routing-page__state">경로를 찾는 중</div>
      ) : null}

      {navigationRoute.isError ? (
        <div className="routing-page__state routing-page__state--error">
          {navigationRoute.hasNavigationNotFound
            ? '경로를 찾을 수 없습니다.'
            : navigationRoute.error?.message}
        </div>
      ) : null}

      {!guidanceStarted ? (
        <BottomNav
          currentKey={currentNav}
          onChange={(key) => {
            if (key === 'navigation') {
              routing.setCurrentNav('navigation')
              return
            }

            if (key === 'map') {
              navigate(ROUTES.MAP)
              return
            }

            if (key === 'my') {
              navigate('/my')
            }
          }}
        />
      ) : null}

      <MapPoiSheet
        key={selectedPoi?.id ?? 'routing-poi-sheet'}
        isOpen={!!selectedPoi}
        place={selectedPoi}
        isRegistered={isSelectedPoiRegistered}
        onClose={closePoiSheet}
        onDeparture={routing.selectDeparture}
        onArrival={routing.selectArrival}
      />

      <BottomSheetBase
        isOpen={routeSheetOpen}
        onClose={routing.closeRouteSheet}
        showBackdrop={false}
        detent="content"
        snapPoints={ROUTE_OPTION_SNAP_POINTS}
        initialSnap={ROUTE_OPTION_INITIAL_SNAP}
        dismissible={false}
        scrollableContent={false}
        contentMaxHeight={ROUTE_OPTION_CONTENT_MAX_HEIGHT}
      >
        <BottomSheetRouteOptions
          mode={transportMode}
          options={navigationRoute.routeOptions}
          onSelectOption={routing.selectRouteOption}
          onStartNavigation={routing.startNavigation}
          maxHeight={ROUTE_OPTION_CONTENT_MAX_HEIGHT}
        />
      </BottomSheetBase>
    </main>
  )
}
