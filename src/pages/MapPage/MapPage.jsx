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
import SearchInput from '../../components/SearchInput/SearchInput'
import TransportSelector from '../../components/Transport/TransportSelector'
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
      await navigationRoute.requestRoute(
        toNavigationRequestInput({
          origin,
          destination,
          transportMode: mode,
          includeIndoor: true,
        }),
      )
      setRouteSheetOpen(true)
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
    navigationRoute.resetRoute()
    setCurrentNav('map')
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
        {guidanceStarted && navigationRoute.selectedFloorplan ? (
          <FloorplanRouteView floorplan={navigationRoute.selectedFloorplan} />
        ) : (
          <KakaoMapView pois={mockMapPois} onPoiSelect={setSelectedPoi} />
        )}
      </div>

      {isRouteMode ? (
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

          {guidanceStarted && navigationRoute.activeFloorSteps.length > 0 ? (
            <div className="map-page__floor-steps">
              {navigationRoute.activeFloorSteps.slice(0, 3).map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className="map-page__floor-step"
                  onClick={() => navigationRoute.selectFloorplan(step.floorId)}
                >
                  {step.instruction}
                </button>
              ))}
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

      <BottomNav currentKey={currentNav} onChange={setCurrentNav} />

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
            setCurrentNav('navigation')
            setRouteSheetOpen(false)
          }}
        />
      </BottomSheetBase>
    </main>
  )
}
