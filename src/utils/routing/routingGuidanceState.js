export const ROUTING_GUIDANCE_STATE_KEY = 'routingGuidance'

export function getRoutingGuidanceState(locationState) {
  return locationState?.[ROUTING_GUIDANCE_STATE_KEY] ?? null
}

export function createRoutingGuidanceState({
  navigationData,
  routeDestination,
  routeOrigin,
  selectedRouteOptionId,
  transportMode,
}) {
  return {
    [ROUTING_GUIDANCE_STATE_KEY]: {
      navigationData,
      routeDestination,
      routeOrigin,
      selectedRouteOptionId,
      transportMode,
    },
  }
}
