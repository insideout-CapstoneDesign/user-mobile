export const normalizeText = (value = '') => value.trim().toLowerCase()

export function resolvePoiFromSearch(selectedSearchPlace, mapPois = []) {
  if (!selectedSearchPlace?.title) return null

  const keyword = normalizeText(selectedSearchPlace.title)
  if (!keyword) return null

  const exactMatch =
    mapPois.find((poi) => normalizeText(poi.name) === keyword) ??
    mapPois.find((poi) => normalizeText(poi.name).includes(keyword))

  if (exactMatch) {
    return {
      ...exactMatch,
      placeId: selectedSearchPlace.placeId ?? exactMatch.placeId ?? null,
      lat: selectedSearchPlace.lat ?? exactMatch.lat,
      lng: selectedSearchPlace.lng ?? exactMatch.lng,
      isRegistered: selectedSearchPlace.isRegistered ?? exactMatch.isRegistered,
      destinationBuildingId:
        selectedSearchPlace.destinationBuildingId ?? exactMatch.destinationBuildingId,
      destinationPoiId: selectedSearchPlace.destinationPoiId ?? exactMatch.destinationPoiId,
    }
  }

  return {
    id: `search-${selectedSearchPlace.id ?? keyword}`,
    placeId: selectedSearchPlace.placeId ?? null,
    name: selectedSearchPlace.title,
    address: selectedSearchPlace.address,
    lat: selectedSearchPlace.lat,
    lng: selectedSearchPlace.lng,
    isRegistered: selectedSearchPlace.isRegistered,
    destinationBuildingId: selectedSearchPlace.destinationBuildingId,
    destinationPoiId: selectedSearchPlace.destinationPoiId,
  }
}
