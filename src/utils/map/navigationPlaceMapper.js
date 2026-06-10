import { firstIntegerId } from '../idHelpers'

export const DEFAULT_ROUTE_ORIGIN = {
  x: 126.951744,
  y: 37.478095,
  name: '현재 위치',
  source: 'current-location',
}

export function toNavigationPlace(place, role = 'destination') {
  if (!place) {
    return null
  }

  const x = firstNumber(place.x, place.lng, place.longitude)
  const y = firstNumber(place.y, place.lat, place.latitude)
  const poiId = firstIntegerId(
    place.poiId,
    place.poiPublicId,
    place.destinationPoiId,
    place.startPoiId,
  )
  const buildingId =
    place.destinationBuildingId ?? place.placeId ?? place.buildingPlaceId ?? place.buildingId ?? null

  if (x === null || y === null) {
    return null
  }

  return {
    x,
    y,
    name: place.name ?? place.title ?? '장소',
    role,
    source: place,
    placeId: buildingId,
    poiId,
    startPoiId: firstIntegerId(place.startPoiId, poiId),
    destinationBuildingId: buildingId,
    destinationPoiId: firstIntegerId(place.destinationPoiId, poiId),
  }
}

export function toNavigationRequestInput({
  origin = DEFAULT_ROUTE_ORIGIN,
  destination,
  transportMode,
  includeIndoor = true,
}) {
  const startPoiId = firstIntegerId(origin?.startPoiId)
  const destinationPoiId = firstIntegerId(destination?.destinationPoiId)
  const shouldIncludeIndoor =
    Boolean(includeIndoor) &&
    (Boolean(startPoiId) || Boolean(destinationPoiId))

  return {
    start: origin,
    end: destination,
    startName: origin?.name,
    endName: destination?.name,
    startPoiId,
    destinationBuildingId: destination?.destinationBuildingId,
    destinationPoiId,
    includeIndoor: shouldIncludeIndoor,
    transportMode,
  }
}

function firstNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}
