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
import { mockMapPois } from '../../mocks/map/poi.mock'
import { mockSearchPlaces } from '../../mocks/search/searchPage.mock'
import isRegisteredPlace from '../../utils/map/isRegisteredPlace'
import { resolvePoiFromSearch } from '../../utils/map/searchPoiResolver'
import useRoutingController from './useRoutingController'
import './RoutingPage.css'

export default function RoutingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSearchPlace = location.state?.selectedSearchPlace
  const [selectedPoi, setSelectedPoi] = useState(() =>
    resolvePoiFromSearch(selectedSearchPlace, mockMapPois),
  )
  const routing = useRoutingController()
  const {
    activeGuidanceStep,
    boundedGuidanceStepIndex,
    currentNav,
    guidanceStarted,
    guidanceSteps,
    guidanceView,
    isIndoorGuidanceStep,
    isRouteMode,
    isTransitGuidance,
    navigationRoute,
    routeDestination,
    routeOrigin,
    routeSheetOpen,
    transitDetailLegs,
    transportMode,
  } = routing
  const registeredPlaces = useMemo(
    () => mockSearchPlaces.filter((place) => place.isRegistered),
    [],
  )
  const isSelectedPoiRegistered = useMemo(
    () => isRegisteredPlace(selectedPoi, registeredPlaces),
    [registeredPlaces, selectedPoi],
  )

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

  return (
    <main className="routing-page">
      <div className="routing-page__viewport">
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
            onBack={routing.openGuidanceList}
            onClose={routing.resetRouteView}
            onRouteClick={routing.openGuidanceList}
            onPrevious={() => routing.moveGuidanceStep(-1)}
            onNext={() => routing.moveGuidanceStep(1)}
          />

          {isIndoorGuidanceStep && navigationRoute.mapFloors.length > 0 ? (
            <div className="routing-page__guidance-floor">
              <FloorSelector
                buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
                floors={navigationRoute.mapFloors}
                activeFloor={navigationRoute.selectedFloorplan}
                onSelect={routing.selectFloorplan}
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
                onBack={routing.showGuidanceMap}
                onClose={routing.resetRouteView}
              />
            ) : (
              <TurnByTurnList
                origin={routeOrigin.name}
                destination={routeDestination?.name ?? '도착지'}
                route={navigationRoute.selectedRouteOption}
                steps={guidanceSteps}
                activeStepId={activeGuidanceStep?.id}
                onBack={routing.showGuidanceMap}
                onClose={routing.resetRouteView}
                onSelectStep={routing.selectGuidanceStep}
              />
            )
          ) : null}
        </>
      ) : isRouteMode ? (
        <>
          <div className="routing-page__direction">
            <DirectionSearch
              origin={routeOrigin.name}
              destination={routeDestination?.name ?? '도착지'}
              onSwap={routing.swapRoute}
              onBack={routing.resetRouteView}
            />
          </div>

          <div className="routing-page__transport">
            <TransportSelector
              activeMode={transportMode}
              onSelect={routing.selectTransportMode}
            />
          </div>

          {navigationRoute.mapFloors.length > 0 ? (
            <div className="routing-page__floor">
              <FloorSelector
                buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
                floors={navigationRoute.mapFloors}
                activeFloor={navigationRoute.selectedFloorplan}
                onSelect={routing.selectFloorplan}
              />
            </div>
          ) : null}
        </>
      ) : (
        <div className="routing-page__search">
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
        <BottomNav currentKey={currentNav} onChange={routing.setCurrentNav} />
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

      <BottomSheetBase isOpen={routeSheetOpen} onClose={routing.closeRouteSheet}>
        <BottomSheetRouteOptions
          mode={transportMode}
          options={navigationRoute.routeOptions}
          onSelectOption={routing.selectRouteOption}
          onStartNavigation={routing.startNavigation}
        />
      </BottomSheetBase>
    </main>
  )
}
