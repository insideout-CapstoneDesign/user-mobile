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
      isRegistered: selectedSearchPlace.isRegistered ?? exactMatch.isRegistered,
    }
  }

  return {
    id: `search-${selectedSearchPlace.id ?? keyword}`,
    name: selectedSearchPlace.title,
    address: selectedSearchPlace.address,
    lat: selectedSearchPlace.lat,
    lng: selectedSearchPlace.lng,
    isRegistered: selectedSearchPlace.isRegistered,
  }
}
