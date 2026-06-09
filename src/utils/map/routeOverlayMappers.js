const GEOGRAPHIC_COORDINATE_TYPES = new Set([
  'WGS84',
  'WGS_84',
  'LNG_LAT',
  'LON_LAT',
  'GEOGRAPHIC',
])

const INDOOR_MAP_TYPES = new Set(['BUILDING', 'INDOOR'])
const INDOOR_MODES = new Set(['INDOOR'])

export function getOutdoorRouteLegs(routeOption) {
  const mapLegs = Array.isArray(routeOption?.mapLegs) ? routeOption.mapLegs : []

  return mapLegs
    .map((leg, index) => normalizeOutdoorRouteLeg(leg, index))
    .filter(Boolean)
}

export function getIndoorFloorplan(routeOption, selectedFloorplan = null) {
  if (selectedFloorplan) {
    return selectedFloorplan
  }

  const floorplans = collectFloorplans(routeOption?.mapLegs)
  return floorplans[0] ?? null
}

export function collectFloorplans(mapLegs) {
  const floorplanMap = new Map()

  if (!Array.isArray(mapLegs)) {
    return []
  }

  mapLegs.forEach((leg) => {
    if (!isIndoorRouteLeg(leg)) {
      return
    }

    const key = leg.floorId ?? `${leg.mapType ?? 'INDOOR'}-${leg.floorName ?? 'default'}`
    const current = floorplanMap.get(key)
    const nextLegs = [...(current?.mapLegs ?? []), leg]
    const steps = nextLegs.flatMap((item) => item.steps ?? [])

    floorplanMap.set(key, {
      key,
      id: current?.id ?? leg.floorId,
      name: current?.name ?? leg.floorName ?? leg.mapType ?? '도면',
      label: current?.label ?? leg.floorName ?? leg.mapType ?? '도면',
      mapType: current?.mapType ?? leg.mapType,
      mapImageUrl: current?.mapImageUrl ?? leg.mapImageUrl,
      coordinateType: current?.coordinateType ?? leg.coordinateType,
      mapLegs: nextLegs,
      paths: nextLegs.map((item) => item.path).filter((path) => path?.length),
      steps,
    })
  })

  return [...floorplanMap.values()]
}

function normalizeOutdoorRouteLeg(leg, index) {
  if (!leg || isIndoorRouteLeg(leg)) {
    return null
  }

  const path = Array.isArray(leg.path) ? leg.path.filter(isGeographicPoint) : []
  if (path.length < 2) {
    return null
  }

  return {
    id: leg.id ?? `route-leg-${index}`,
    mapLegId: leg.mapLegId ?? leg.id ?? `route-leg-${index}`,
    segmentId: leg.segmentId ?? leg.id ?? `route-leg-${index}`,
    mode: leg.mode,
    routeType: leg.routeType,
    routeOption: leg.routeOption,
    routeColor: leg.routeColor,
    path,
  }
}

export function isIndoorRouteLeg(leg) {
  const coordinateType = String(leg?.coordinateType ?? '').toUpperCase()
  const mapType = String(leg?.mapType ?? '').toUpperCase()
  const mode = String(leg?.mode ?? '').toUpperCase()

  return (
    coordinateType === 'PIXEL' ||
    INDOOR_MAP_TYPES.has(mapType) ||
    INDOOR_MODES.has(mode)
  )
}

function isGeographicPoint(point) {
  return (
    typeof point?.x === 'number' &&
    typeof point?.y === 'number' &&
    point.x >= -180 &&
    point.x <= 180 &&
    point.y >= -90 &&
    point.y <= 90
  )
}

export function isGeographicCoordinateType(coordinateType) {
  return GEOGRAPHIC_COORDINATE_TYPES.has(String(coordinateType ?? '').toUpperCase())
}
