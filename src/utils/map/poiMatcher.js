function getDistanceMeters(from, to) {
  const earthRadius = 6371000
  const degToRad = Math.PI / 180
  const dLat = (to.lat - from.lat) * degToRad
  const dLng = (to.lng - from.lng) * degToRad
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * degToRad) *
      Math.cos(to.lat * degToRad) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function findNearestPoi(clickPoint, pois) {
  let nearestPoi = null
  let nearestDistance = Number.POSITIVE_INFINITY

  pois.forEach((poi) => {
    const distance = getDistanceMeters(clickPoint, poi)
    if (distance < nearestDistance) {
      nearestPoi = poi
      nearestDistance = distance
    }
  })

  return { nearestPoi, nearestDistance }
}

export function findNearestPoiWithinRadius(clickPoint, pois, radiusMeters) {
  const { nearestPoi, nearestDistance } = findNearestPoi(clickPoint, pois)
  if (!nearestPoi || nearestDistance > radiusMeters) return null
  return nearestPoi
}
