import { DEFAULT_MAP_CENTER, DEFAULT_MAP_LEVEL } from '../../constants/map'

export function isValidMapCenter(center) {
  return (
    center &&
    typeof center.lat === 'number' &&
    Number.isFinite(center.lat) &&
    typeof center.lng === 'number' &&
    Number.isFinite(center.lng)
  )
}

export function isValidMapLevel(level) {
  return typeof level === 'number' && Number.isFinite(level)
}

export function getMapViewportState(state = {}) {
  return {
    mapCenter: isValidMapCenter(state.mapCenter)
      ? state.mapCenter
      : DEFAULT_MAP_CENTER,
    mapLevel: isValidMapLevel(state.mapLevel) ? state.mapLevel : DEFAULT_MAP_LEVEL,
  }
}
