import { isNavigationNotFoundCode } from './navigationErrors'
import { normalizeRouteOption } from './navigationRouteMapper'

export default function normalizeNavigationResponse(response = {}) {
  const normalizedResponse = response && typeof response === 'object' ? response : {}
  const routes = Array.isArray(normalizedResponse.routes) ? normalizedResponse.routes : []
  const failures = normalizeFailures(normalizedResponse)
  const routeOptions = routes.map((route, index) => normalizeRouteOption(route, index))
  const mapLegs = routeOptions.flatMap((option) => option.mapLegs)
  const turnByTurnSteps = routeOptions.flatMap((option) => option.turnByTurnSteps)

  return {
    raw: normalizedResponse,
    requestedDestination: normalizedResponse.requestedDestination ?? null,
    routedDestination: normalizedResponse.routedDestination ?? null,
    indoor: normalizedResponse.indoor ?? null,
    message: normalizedResponse.message ?? null,
    routes,
    routeOptions,
    mapLegs,
    turnByTurnSteps,
    failures,
    hasNavigationNotFoundFailure: hasNavigationNotFoundFailure(failures),
  }
}

function normalizeFailures(response) {
  const rootFailures = Array.isArray(response.failures) ? response.failures : []
  const routeFailures = (Array.isArray(response.routes) ? response.routes : [])
    .flatMap((route) => (Array.isArray(route.failures) ? route.failures : []))

  return [...rootFailures, ...routeFailures].filter(Boolean)
}

function hasNavigationNotFoundFailure(failures) {
  return failures.some((failure) => isNavigationNotFoundCode(failure?.code))
}
