import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import BottomSheetBase from '../../components/BottomSheet/BottomSheetBase'
import BottomSheetRouteOptions from '../../components/BottomSheet/types/BottomSheetRouteOptions'
import DirectionSearch from '../../components/Direction/DirectionSearch'
import FloorSelector from '../../components/Floor/FloorSelector'
import FloorplanRouteView from '../../components/Map/FloorplanRouteView'
import KakaoMapView from '../../components/Map/KakaoMapView'
import MapPoiSheet from '../../components/Map/MapPoiSheet'
import NavigationMapOverlay from '../../components/NavigationGuidance/NavigationMapOverlay'
import SearchInput from '../../components/SearchInput/SearchInput'
import TransportSelector from '../../components/Transport/TransportSelector'
import TransitTurnByTurnList from '../../components/NavigationGuidance/TransitTurnByTurnList'
import TurnByTurnList from '../../components/NavigationGuidance/TurnByTurnList'
import { buildTransitDetailLegs } from '../../components/NavigationGuidance/transitDetailMapper'
import useNavigationRoute from '../../hooks/useNavigationRoute'
import { mockMapPois } from '../../mocks/map/poi.mock'
import { mockSearchPlaces } from '../../mocks/search/searchPage.mock'
import isRegisteredPlace from '../../utils/map/isRegisteredPlace'
import {
  DEFAULT_ROUTE_ORIGIN,
  toNavigationPlace,
  toNavigationRequestInput,
} from '../../utils/map/navigationPlaceMapper'
import { resolvePoiFromSearch } from '../../utils/map/searchPoiResolver'
import './MapPage.css'

export default function MapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSearchPlace = location.state?.selectedSearchPlace
  const [currentNav, setCurrentNav] = useState('map')
  const [transportMode, setTransportMode] = useState('walk')
  const [routeSheetOpen, setRouteSheetOpen] = useState(false)
  const [guidanceStarted, setGuidanceStarted] = useState(false)
  const [guidanceView, setGuidanceView] = useState('map')
  const [activeGuidanceStepIndex, setActiveGuidanceStepIndex] = useState(0)
  const [routeOrigin, setRouteOrigin] = useState(DEFAULT_ROUTE_ORIGIN)
  const [routeDestination, setRouteDestination] = useState(null)
  const [selectedPoi, setSelectedPoi] = useState(() =>
    resolvePoiFromSearch(selectedSearchPlace, mockMapPois),
  )
  const navigationRoute = useNavigationRoute()
  const registeredPlaces = useMemo(
    () => mockSearchPlaces.filter((place) => place.isRegistered),
    [],
  )
  const isSelectedPoiRegistered = useMemo(
    () => isRegisteredPlace(selectedPoi, registeredPlaces),
    [registeredPlaces, selectedPoi],
  )
  const isRouteMode = currentNav === 'navigation' || guidanceStarted
  const guidanceSteps = useMemo(
    () =>
      navigationRoute.turnByTurnSteps.length > 0
        ? navigationRoute.turnByTurnSteps
        : navigationRoute.activeFloorSteps,
    [navigationRoute.activeFloorSteps, navigationRoute.turnByTurnSteps],
  )
  const boundedGuidanceStepIndex = Math.min(
    activeGuidanceStepIndex,
    Math.max(guidanceSteps.length - 1, 0),
  )
  const activeGuidanceStep =
    guidanceSteps[boundedGuidanceStepIndex] ?? guidanceSteps[0] ?? null
  const isIndoorGuidanceStep =
    !!activeGuidanceStep?.floorId ||
    activeGuidanceStep?.type === 'indoor' ||
    activeGuidanceStep?.mode === 'INDOOR'
  const isTransitGuidance =
    navigationRoute.selectedRouteOption?.mode === 'transit' ||
    navigationRoute.selectedRouteOption?.routeType === 'TRANSIT'
  const transitDetailLegs = useMemo(
    () => buildTransitDetailLegs(navigationRoute.selectedRouteOption),
    [navigationRoute.selectedRouteOption],
  )

  const closePoiSheet = () => {
    setSelectedPoi(null)
  }

  const requestRoute = async ({
    origin = routeOrigin,
    destination = routeDestination,
    mode = transportMode,
  } = {}) => {
    if (!origin || !destination) {
      return
    }

    setCurrentNav('navigation')
    setGuidanceStarted(false)

    try {
      const routeData = await navigationRoute.requestRoute(
        toNavigationRequestInput({
          origin,
          destination,
          transportMode: mode,
          includeIndoor: true,
        }),
      )

      if (routeData) {
        setRouteSheetOpen(true)
      }
    } catch {
      setRouteSheetOpen(false)
    }
  }

  const handleSelectDeparture = (place) => {
    const origin = toNavigationPlace(place, 'origin')
    if (!origin) {
      return
    }

    setRouteOrigin(origin)
    setCurrentNav('navigation')

    if (routeDestination) {
      requestRoute({ origin, destination: routeDestination })
    }
  }

  const handleSelectArrival = (place) => {
    const destination = toNavigationPlace(place, 'destination')
    if (!destination) {
      return
    }

    setRouteDestination(destination)
    requestRoute({ destination })
  }

  const handleSwapRoute = () => {
    if (!routeDestination) {
      return
    }

    const nextOrigin = routeDestination
    const nextDestination = routeOrigin
    setRouteOrigin(nextOrigin)
    setRouteDestination(nextDestination)
    requestRoute({ origin: nextOrigin, destination: nextDestination })
  }

  const handleSelectTransportMode = (nextMode) => {
    setTransportMode(nextMode)

    if (routeDestination) {
      requestRoute({ mode: nextMode })
    }
  }

  const openSearchPage = () => {
    navigate('/search')
  }

  const resetRouteView = () => {
    setGuidanceStarted(false)
    setGuidanceView('map')
    setActiveGuidanceStepIndex(0)
    setRouteSheetOpen(false)
    navigationRoute.resetRoute()
    setCurrentNav('map')
  }

  const selectGuidanceStep = (step, index) => {
    setActiveGuidanceStepIndex(index)
    setGuidanceView('map')

    if (step?.floorId) {
      navigationRoute.selectFloorplan(step.floorId)
    }
  }

  const moveGuidanceStep = (direction) => {
    const nextIndex = boundedGuidanceStepIndex + direction

    if (nextIndex < 0 || nextIndex >= guidanceSteps.length) {
      return
    }

    const nextStep = guidanceSteps[nextIndex]
    setActiveGuidanceStepIndex(nextIndex)

    if (nextStep?.floorId) {
      navigationRoute.selectFloorplan(nextStep.floorId)
    }
  }

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSearchPage()
    }
  }

  return (
    <main className="map-page">
      <div className="map-page__viewport">
        {guidanceStarted && isIndoorGuidanceStep && navigationRoute.selectedFloorplan ? (
          <FloorplanRouteView
            floorplan={navigationRoute.selectedFloorplan}
            showInstructionBadge={false}
          />
        ) : (
          <KakaoMapView pois={mockMapPois} onPoiSelect={setSelectedPoi} />
        )}
      </div>

      {guidanceStarted ? (
        <>
          <NavigationMapOverlay
            origin={routeOrigin.name}
            destination={routeDestination?.name ?? '도착지'}
            step={activeGuidanceStep}
            activeIndex={boundedGuidanceStepIndex}
            total={guidanceSteps.length}
            onBack={() => setGuidanceView('list')}
            onClose={resetRouteView}
            onRouteClick={() => setGuidanceView('list')}
            onPrevious={() => moveGuidanceStep(-1)}
            onNext={() => moveGuidanceStep(1)}
          />

          {isIndoorGuidanceStep && navigationRoute.mapFloors.length > 0 ? (
            <div className="map-page__guidance-floor">
              <FloorSelector
                buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
                floors={navigationRoute.mapFloors}
                activeFloor={navigationRoute.selectedFloorplan}
                onSelect={navigationRoute.selectFloorplan}
              />
            </div>
          ) : null}

          {guidanceView === 'list' ? (
            isTransitGuidance ? (
              <TransitTurnByTurnList
                origin={routeOrigin.name}
                destination={routeDestination?.name ?? '도착지'}
                route={navigationRoute.selectedRouteOption}
                legs={transitDetailLegs}
                onBack={() => setGuidanceView('map')}
                onClose={resetRouteView}
              />
            ) : (
              <TurnByTurnList
                origin={routeOrigin.name}
                destination={routeDestination?.name ?? '도착지'}
                route={navigationRoute.selectedRouteOption}
                steps={guidanceSteps}
                activeStepId={activeGuidanceStep?.id}
                onBack={() => setGuidanceView('map')}
                onClose={resetRouteView}
                onSelectStep={selectGuidanceStep}
              />
            )
          ) : null}
        </>
      ) : isRouteMode ? (
        <>
          <div className="map-page__direction">
            <DirectionSearch
              origin={routeOrigin.name}
              destination={routeDestination?.name ?? '도착지'}
              onSwap={handleSwapRoute}
              onBack={resetRouteView}
            />
          </div>

          <div className="map-page__transport">
            <TransportSelector
              activeMode={transportMode}
              onSelect={handleSelectTransportMode}
            />
          </div>

          {navigationRoute.mapFloors.length > 0 ? (
            <div className="map-page__floor">
              <FloorSelector
                buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
                floors={navigationRoute.mapFloors}
                activeFloor={navigationRoute.selectedFloorplan}
                onSelect={navigationRoute.selectFloorplan}
              />
            </div>
          ) : null}

        </>
      ) : (
        <div className="map-page__search">
          <SearchInput
            value=""
            placeholder="건물, 장소 검색"
            readOnly
            onClick={openSearchPage}
            onKeyDown={handleSearchInputKeyDown}
          />
        </div>
      )}

      {navigationRoute.isLoading ? (
        <div className="map-page__state">경로를 찾는 중</div>
      ) : null}

      {navigationRoute.isError ? (
        <div className="map-page__state map-page__state--error">
          {navigationRoute.hasNavigationNotFound
            ? '경로를 찾을 수 없습니다.'
            : navigationRoute.error?.message}
        </div>
      ) : null}

      {!guidanceStarted ? (
        <BottomNav currentKey={currentNav} onChange={setCurrentNav} />
      ) : null}

      <MapPoiSheet
        key={selectedPoi?.id ?? 'map-poi-sheet'}
        isOpen={!!selectedPoi}
        place={selectedPoi}
        isRegistered={isSelectedPoiRegistered}
        onClose={closePoiSheet}
        onDeparture={handleSelectDeparture}
        onArrival={handleSelectArrival}
      />

      <BottomSheetBase isOpen={routeSheetOpen} onClose={() => setRouteSheetOpen(false)}>
        <BottomSheetRouteOptions
          mode={transportMode}
          options={navigationRoute.routeOptions}
          onSelectOption={navigationRoute.selectRouteOption}
          onStartNavigation={(option) => {
            navigationRoute.selectRouteOption(option)
            setGuidanceStarted(true)
            setGuidanceView('list')
            setActiveGuidanceStepIndex(0)
            setCurrentNav('navigation')
            setRouteSheetOpen(false)
          }}
        />
      </BottomSheetBase>
    </main>
  )
}
