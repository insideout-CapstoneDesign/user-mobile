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

export function getIndoorFloorplan(
  routeOption,
  selectedFloorplan = null,
  buildingFloorplans = [],
) {
  if (selectedFloorplan) {
    return selectedFloorplan
  }

  const floorplans = collectFloorplans(routeOption?.mapLegs, buildingFloorplans)
  return floorplans[0] ?? null
}

export function isIndoorOnlyRouteOption(routeOption) {
  const mapLegs = Array.isArray(routeOption?.mapLegs) ? routeOption.mapLegs : []

  if (mapLegs.length === 0) {
    return false
  }

  return mapLegs.every(isIndoorRouteLeg)
}

export function collectFloorplans(mapLegs, buildingFloorplans = []) {
  const floorplanMap = new Map()

  const routeMapLegs = Array.isArray(mapLegs) ? mapLegs : []
  const allBuildingFloorplans = Array.isArray(buildingFloorplans) ? buildingFloorplans : []

  routeMapLegs.forEach((leg) => {
    if (!isIndoorRouteLeg(leg)) {
      return
    }

    const key = getMapFloorKey(leg)
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

  allBuildingFloorplans.forEach((floorplan) => {
    if (!floorplan || typeof floorplan !== 'object' || !floorplan.mapImageUrl) {
      return
    }

    const key = getBuildingFloorplanKey(floorplan)

    if (floorplanMap.has(key)) {
      return
    }

    floorplanMap.set(key, {
      key,
      id: floorplan.floorId ?? floorplan.id ?? null,
      name: floorplan.floorName ?? floorplan.name ?? '도면',
      label: floorplan.floorName ?? floorplan.name ?? '도면',
      mapType: 'BUILDING',
      mapImageUrl: floorplan.mapImageUrl,
      coordinateType: floorplan.coordinateType ?? 'PIXEL',
      mapLegs: [],
      paths: [],
      steps: [],
    })
  })

  return [...floorplanMap.values()]
}

function getMapFloorKey(mapLeg) {
  return mapLeg?.floorId ?? `${mapLeg?.mapType ?? 'INDOOR'}-${mapLeg?.floorName ?? 'default'}`
}

function getBuildingFloorplanKey(floorplan) {
  return (
    floorplan?.floorId ??
    floorplan?.id ??
    `${floorplan?.floorName ?? floorplan?.name ?? 'floor'}`
  )
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
