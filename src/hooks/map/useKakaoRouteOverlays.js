import { useEffect, useRef } from 'react'

const ROUTE_STYLE_BY_MODE = {
  bus: '#2563eb',
  car: '#2563eb',
  campus: '#0f766e',
  subway: '#7c3aed',
  walk: '#16a34a',
}

export default function useKakaoRouteOverlays({
  map,
  routeLegs = [],
  fitBounds = false,
}) {
  const overlaysRef = useRef([])

  useEffect(() => {
    clearOverlays(overlaysRef)

    if (!map || !window.kakao?.maps || routeLegs.length === 0) {
      return undefined
    }

    const kakaoMaps = window.kakao.maps
    const bounds = new kakaoMaps.LatLngBounds()
    let hasBounds = false

    routeLegs.forEach((leg) => {
      const path = toLatLngPath(kakaoMaps, leg.path)
      if (path.length < 2) {
        return
      }

      path.forEach((position) => {
        bounds.extend(position)
        hasBounds = true
      })

      const outline = new kakaoMaps.Polyline({
        map,
        path,
        strokeWeight: 11,
        strokeColor: 'rgba(255, 255, 255, 0.92)',
        strokeOpacity: 1,
        strokeStyle: 'solid',
      })
      const routeLine = new kakaoMaps.Polyline({
        map,
        path,
        strokeWeight: 6,
        strokeColor: resolveRouteColor(leg),
        strokeOpacity: 0.92,
        strokeStyle: 'solid',
      })

      overlaysRef.current.push(outline, routeLine)
    })

    if (fitBounds && hasBounds) {
      map.setBounds(bounds, 36, 80, 36, 36)
    }

    return () => clearOverlays(overlaysRef)
  }, [fitBounds, map, routeLegs])
}

function toLatLngPath(kakaoMaps, path) {
  if (!Array.isArray(path)) {
    return []
  }

  return path
    .filter(isValidGeographicPoint)
    .map((point) => new kakaoMaps.LatLng(point.y, point.x))
}

function isValidGeographicPoint(point) {
  return (
    typeof point?.x === 'number' &&
    typeof point?.y === 'number' &&
    point.x >= -180 &&
    point.x <= 180 &&
    point.y >= -90 &&
    point.y <= 90
  )
}

function resolveRouteColor(leg) {
  if (typeof leg?.routeColor === 'string' && leg.routeColor.trim()) {
    return normalizeHexColor(leg.routeColor)
  }

  return ROUTE_STYLE_BY_MODE[String(leg?.mode ?? '').toLowerCase()] ?? '#2563eb'
}

function normalizeHexColor(color) {
  const trimmed = color.trim()
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

function clearOverlays(overlaysRef) {
  overlaysRef.current.forEach((overlay) => overlay.setMap(null))
  overlaysRef.current = []
}
