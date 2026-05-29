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
import useMapNavigationController from './useMapNavigationController'
import './MapPage.css'

export default function MapPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedSearchPlace = location.state?.selectedSearchPlace
  const [selectedPoi, setSelectedPoi] = useState(() =>
    resolvePoiFromSearch(selectedSearchPlace, mockMapPois),
  )
  const navigation = useMapNavigationController()
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
  } = navigation
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
            onBack={navigation.openGuidanceList}
            onClose={navigation.resetRouteView}
            onRouteClick={navigation.openGuidanceList}
            onPrevious={() => navigation.moveGuidanceStep(-1)}
            onNext={() => navigation.moveGuidanceStep(1)}
          />

          {isIndoorGuidanceStep && navigationRoute.mapFloors.length > 0 ? (
            <div className="map-page__guidance-floor">
              <FloorSelector
                buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
                floors={navigationRoute.mapFloors}
                activeFloor={navigationRoute.selectedFloorplan}
                onSelect={navigation.selectFloorplan}
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
                onBack={navigation.showGuidanceMap}
                onClose={navigation.resetRouteView}
              />
            ) : (
              <TurnByTurnList
                origin={routeOrigin.name}
                destination={routeDestination?.name ?? '도착지'}
                route={navigationRoute.selectedRouteOption}
                steps={guidanceSteps}
                activeStepId={activeGuidanceStep?.id}
                onBack={navigation.showGuidanceMap}
                onClose={navigation.resetRouteView}
                onSelectStep={navigation.selectGuidanceStep}
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
              onSwap={navigation.swapRoute}
              onBack={navigation.resetRouteView}
            />
          </div>

          <div className="map-page__transport">
            <TransportSelector
              activeMode={transportMode}
              onSelect={navigation.selectTransportMode}
            />
          </div>

          {navigationRoute.mapFloors.length > 0 ? (
            <div className="map-page__floor">
              <FloorSelector
                buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
                floors={navigationRoute.mapFloors}
                activeFloor={navigationRoute.selectedFloorplan}
                onSelect={navigation.selectFloorplan}
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
        <BottomNav currentKey={currentNav} onChange={navigation.setCurrentNav} />
      ) : null}

      <MapPoiSheet
        key={selectedPoi?.id ?? 'map-poi-sheet'}
        isOpen={!!selectedPoi}
        place={selectedPoi}
        isRegistered={isSelectedPoiRegistered}
        onClose={closePoiSheet}
        onDeparture={navigation.selectDeparture}
        onArrival={navigation.selectArrival}
      />

      <BottomSheetBase isOpen={routeSheetOpen} onClose={navigation.closeRouteSheet}>
        <BottomSheetRouteOptions
          mode={transportMode}
          options={navigationRoute.routeOptions}
          onSelectOption={navigation.selectRouteOption}
          onStartNavigation={navigation.startNavigation}
        />
      </BottomSheetBase>
    </main>
  )
}
