import { normalizeText } from './searchPoiResolver'

export default function isRegisteredPlace(selectedPoi, registeredPlaces = []) {
  if (!selectedPoi) return false
  if (selectedPoi.isRegistered === true) return true

  const poiName = normalizeText(selectedPoi.name)

  return registeredPlaces.some((place) => {
    const registeredName = normalizeText(place?.title ?? place?.name)
    if (!registeredName) return false
    return poiName.includes(registeredName)
  })
}
