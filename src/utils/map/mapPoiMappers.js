export function mapNearestPlaceToPoi(place) {
  return {
    id:
      place.externalApiId ??
      place.id ??
      `${place.name ?? place.placeName ?? 'place'}-${place.lat}-${place.lng}`,
    name: place.name ?? place.placeName ?? place.title ?? '장소명',
    address: place.roadAddress || place.address || '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId,
  }
}

export function mapRoutePlaceToPoi(place) {
  if (!place) return null

  return {
    id: place.externalApiId ?? place.id ?? `route-${place.name ?? place.title ?? 'place'}`,
    name: place.name ?? place.title ?? '장소명',
    address: place.address ?? place.roadAddress ?? '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    isRegistered: Boolean(place.isRegistered),
    externalApiId: place.externalApiId ?? null,
  }
}

export function mapPoiToRoutingPlace(place) {
  if (!place) return null

  return {
    ...place,
    name: place.name ?? place.title ?? '장소',
    title: place.name ?? place.title ?? '장소',
    address: place.address ?? '주소 정보 없음',
    lat: place.lat,
    lng: place.lng,
    externalApiId: place.externalApiId ?? place.id ?? null,
    isRegistered: Boolean(place.isRegistered),
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
    source: 'map-current-location',
  }
}
