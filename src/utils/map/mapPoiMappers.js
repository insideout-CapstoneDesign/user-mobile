function getCanonicalPlaceId(place) {
  return (
    place?.placeId ??
    place?.destinationBuildingId ??
    place?.buildingPlaceId ??
    place?.buildingId ??
    null
  )
}

function getCanonicalPoiId(place) {
  return place?.poiId ?? place?.destinationPoiId ?? place?.startPoiId ?? null
}

function getBasePlaceName(place) {
  return place?.name ?? place?.placeName ?? place?.title ?? '장소명'
}

function getDisplayName(place, baseName) {
  return (
    place?.displayName ??
    (place?.parentBuildingName ? `${place.parentBuildingName} · ${baseName}` : null)
  )
}

export function mapNearestPlaceToPoi(place) {
  const baseName = getBasePlaceName(place)
  const placeId = getCanonicalPlaceId(place)
  const poiId = getCanonicalPoiId(place)
  const displayName = getDisplayName(place, baseName)

  return {
    id: place.externalApiId ?? poiId ?? placeId ?? `${baseName}-${place.lat}-${place.lng}`,
    placeId,
    poiId,
    publicId: poiId ?? place.externalApiId ?? placeId ?? null,
    startPoiId: place.startPoiId ?? poiId,
    destinationPoiId: place.destinationPoiId ?? poiId,
    destinationBuildingId: place.destinationBuildingId ?? placeId ?? null,
    name: baseName,
    title: baseName,
    displayName,
    parentBuildingName: place.parentBuildingName ?? null,
    address: place.roadAddress || place.address || '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId ?? null,
  }
}

export function mapSearchPlaceToPoi(place) {
  if (!place) return null

  const baseName = getBasePlaceName(place)
  const placeId = getCanonicalPlaceId(place)
  const poiId = getCanonicalPoiId(place)
  const displayName = getDisplayName(place, baseName)

  return {
    id: place.externalApiId ?? poiId ?? placeId ?? `search-${baseName}`,
    placeId,
    poiId,
    publicId: poiId ?? place.externalApiId ?? placeId ?? null,
    startPoiId: place.startPoiId ?? poiId,
    destinationPoiId: place.destinationPoiId ?? poiId,
    destinationBuildingId: place.destinationBuildingId ?? placeId ?? null,
    name: baseName,
    title: baseName,
    displayName,
    parentBuildingName: place.parentBuildingName ?? null,
    address: place.address ?? place.roadAddress ?? '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId ?? null,
  }
}

export function mapRoutePlaceToPoi(place) {
  if (!place) return null

  const baseName = getBasePlaceName(place)
  const placeId = getCanonicalPlaceId(place)
  const poiId = getCanonicalPoiId(place)
  const displayName = getDisplayName(place, baseName)

  return {
    id: place.externalApiId ?? poiId ?? placeId ?? `route-${baseName}`,
    placeId,
    poiId,
    publicId: poiId ?? place.externalApiId ?? placeId ?? null,
    startPoiId: place.startPoiId ?? poiId,
    destinationPoiId: place.destinationPoiId ?? poiId,
    destinationBuildingId: place.destinationBuildingId ?? placeId ?? null,
    name: baseName,
    title: baseName,
    displayName,
    parentBuildingName: place.parentBuildingName ?? null,
    address: place.address ?? place.roadAddress ?? '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId ?? null,
  }
}

export function mapPoiToRoutingPlace(place) {
  if (!place) return null

  const baseName = getBasePlaceName(place)
  const placeId = getCanonicalPlaceId(place)
  const poiId = getCanonicalPoiId(place)
  const displayName = getDisplayName(place, baseName)

  return {
    ...place,
    placeId,
    poiId,
    name: baseName,
    title: baseName,
    displayName,
    parentBuildingName: place.parentBuildingName ?? null,
    address: place.address ?? '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    externalApiId: place.externalApiId ?? place.id ?? null,
    isRegistered: Boolean(place.isRegistered),
    publicId: poiId ?? place.externalApiId ?? placeId ?? null,
    startPoiId: place.startPoiId ?? poiId ?? null,
    destinationBuildingId: place.destinationBuildingId ?? placeId ?? null,
    destinationPoiId: place.destinationPoiId ?? poiId ?? null,
  }
}

export function createCurrentLocationOrigin({ lat, lng, address }) {
  const safeAddress = address || '현재 위치'

  return {
    x: lng,
    y: lat,
    lat,
    lng,
    name: safeAddress,
    title: safeAddress,
    address: safeAddress,
    source: 'current-location',
  }
}
