import { useMemo, useState } from 'react'
import {
  buildTransitDetailLegs,
  buildTransitGuidanceSteps,
} from '../../components/NavigationGuidance/transitDetailMapper'
import useNavigationRoute from '../../hooks/useNavigationRoute'
import {
  DEFAULT_ROUTE_ORIGIN,
  toNavigationPlace,
  toNavigationRequestInput,
} from '../../utils/map/navigationPlaceMapper'
import { isIndoorStep } from '../../utils/navigationStepTypes'

export default function useRoutingController({
  initialCurrentNav = 'map',
  initialGuidanceStarted = false,
  initialGuidanceView = initialGuidanceStarted ? 'list' : 'map',
  initialNavigationData = null,
  initialRouteDestination = null,
  initialRouteOrigin = DEFAULT_ROUTE_ORIGIN,
  initialSelectedRouteOptionId = null,
  initialTransportMode = 'walk',
} = {}) {
  const [currentNav, setCurrentNav] = useState(initialCurrentNav)
  const [transportMode, setTransportMode] = useState(initialTransportMode)
  const [routeSheetOpen, setRouteSheetOpen] = useState(false)
  const [guidanceStarted, setGuidanceStarted] = useState(initialGuidanceStarted)
  const [guidanceView, setGuidanceView] = useState(initialGuidanceView)
  const [activeGuidanceStepIndex, setActiveGuidanceStepIndex] = useState(0)
  const [routeOrigin, setRouteOrigin] = useState(initialRouteOrigin)
  const [routeDestination, setRouteDestination] = useState(initialRouteDestination)
  const navigationRoute = useNavigationRoute({
    initialData: initialNavigationData,
    initialSelectedRouteOptionId,
  })

  const isRouteMode = currentNav === 'navigation' || guidanceStarted
  const guidanceSteps = useMemo(
    () =>
      navigationRoute.turnByTurnSteps.length > 0
        ? navigationRoute.turnByTurnSteps
        : navigationRoute.activeFloorSteps,
    [navigationRoute.activeFloorSteps, navigationRoute.turnByTurnSteps],
  )
  const isTransitGuidance =
    navigationRoute.selectedRouteOption?.mode === 'transit' ||
    navigationRoute.selectedRouteOption?.routeType === 'TRANSIT'
  const transitDetailLegs = useMemo(
    () =>
      buildTransitDetailLegs(navigationRoute.selectedRouteOption, {
        origin: routeOrigin,
        destination: routeDestination,
      }),
    [navigationRoute.selectedRouteOption, routeDestination, routeOrigin],
  )
  const transitGuidanceSteps = useMemo(
    () => buildTransitGuidanceSteps(navigationRoute.selectedRouteOption),
    [navigationRoute.selectedRouteOption],
  )
  const effectiveGuidanceSteps = isTransitGuidance
    ? transitGuidanceSteps
    : guidanceSteps
  const effectiveBoundedGuidanceStepIndex = Math.min(
    activeGuidanceStepIndex,
    Math.max(effectiveGuidanceSteps.length - 1, 0),
  )
  const effectiveActiveGuidanceStep =
    effectiveGuidanceSteps[effectiveBoundedGuidanceStepIndex] ??
    effectiveGuidanceSteps[0] ??
    null
  const isIndoorGuidanceStep = isIndoorStep(effectiveActiveGuidanceStep)

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
    const resolvedIndex = effectiveGuidanceSteps.findIndex(
      (guidanceStep) => guidanceStep?.id === step?.id,
    )
    setActiveGuidanceStepIndex(resolvedIndex >= 0 ? resolvedIndex : index)
    setGuidanceView('map')

    if (step?.floorId) {
      navigationRoute.selectFloorplan(step.floorId)
    }
  }

  const selectTransitDetailLeg = (leg) => {
    if (leg?.type === 'point' || leg?.sourceLegIndex === undefined) {
      return
    }

    const stepIndex = transitGuidanceSteps.findIndex(
      (step) => step?.sourceLegIndex === leg.sourceLegIndex,
    )

    if (stepIndex < 0) {
      return
    }

    selectGuidanceStep(transitGuidanceSteps[stepIndex], stepIndex)
  }

  const moveGuidanceStep = (direction) => {
    const nextIndex = effectiveBoundedGuidanceStepIndex + direction

    if (nextIndex < 0 || nextIndex >= effectiveGuidanceSteps.length) {
      return
    }

    const nextStep = effectiveGuidanceSteps[nextIndex]
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
    activeGuidanceStep: effectiveActiveGuidanceStep,
    boundedGuidanceStepIndex: effectiveBoundedGuidanceStepIndex,
    currentNav,
    guidanceStarted,
    guidanceSteps: effectiveGuidanceSteps,
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
    selectTransitDetailLeg,
    selectRouteOption: navigationRoute.selectRouteOption,
    selectTransportMode,
    setCurrentNav,
    showGuidanceMap: () => setGuidanceView('map'),
    startNavigation,
    swapRoute,
  }
}
