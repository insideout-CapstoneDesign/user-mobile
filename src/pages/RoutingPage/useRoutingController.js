import { useMemo, useState } from 'react'
import { buildTransitDetailLegs } from '../../components/NavigationGuidance/transitDetailMapper'
import useNavigationRoute from '../../hooks/useNavigationRoute'
import {
  DEFAULT_ROUTE_ORIGIN,
  toNavigationPlace,
  toNavigationRequestInput,
} from '../../utils/map/navigationPlaceMapper'

export default function useRoutingController() {
  const [currentNav, setCurrentNav] = useState('map')
  const [transportMode, setTransportMode] = useState('walk')
  const [routeSheetOpen, setRouteSheetOpen] = useState(false)
  const [guidanceStarted, setGuidanceStarted] = useState(false)
  const [guidanceView, setGuidanceView] = useState('map')
  const [activeGuidanceStepIndex, setActiveGuidanceStepIndex] = useState(0)
  const [routeOrigin, setRouteOrigin] = useState(DEFAULT_ROUTE_ORIGIN)
  const [routeDestination, setRouteDestination] = useState(null)
  const navigationRoute = useNavigationRoute()

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

  const selectDeparture = (place) => {
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

  const selectArrival = (place) => {
    const destination = toNavigationPlace(place, 'destination')
    if (!destination) {
      return
    }

    setRouteDestination(destination)
    requestRoute({ destination })
  }

  const swapRoute = () => {
    if (!routeDestination) {
      return
    }

    const nextOrigin = routeDestination
    const nextDestination = routeOrigin
    setRouteOrigin(nextOrigin)
    setRouteDestination(nextDestination)
    requestRoute({ origin: nextOrigin, destination: nextDestination })
  }

  const selectTransportMode = (nextMode) => {
    setTransportMode(nextMode)

    if (routeDestination) {
      requestRoute({ mode: nextMode })
    }
  }

  const resetRouteView = () => {
    setGuidanceStarted(false)
    setGuidanceView('map')
    setActiveGuidanceStepIndex(0)
    setRouteSheetOpen(false)
    navigationRoute.resetRoute()
    setCurrentNav('navigation')
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

  const startNavigation = (option) => {
    navigationRoute.selectRouteOption(option)
    setGuidanceStarted(true)
    setGuidanceView('list')
    setActiveGuidanceStepIndex(0)
    setCurrentNav('navigation')
    setRouteSheetOpen(false)
  }

  return {
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
    closeRouteSheet: () => setRouteSheetOpen(false),
    moveGuidanceStep,
    openGuidanceList: () => setGuidanceView('list'),
    resetRouteView,
    selectArrival,
    selectDeparture,
    selectFloorplan: navigationRoute.selectFloorplan,
    selectGuidanceStep,
    selectRouteOption: navigationRoute.selectRouteOption,
    selectTransportMode,
    setCurrentNav,
    showGuidanceMap: () => setGuidanceView('map'),
    startNavigation,
    swapRoute,
  }
}
