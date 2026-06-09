import { useEffect, useRef } from 'react'
import { getRouteDisplayColor } from '../../components/NavigationGuidance/routeColor'

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
        strokeWeight: resolveStrokeWeight(leg),
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
  if (String(leg?.mode ?? '').toLowerCase() === 'walk') {
    return resolveCssColor('var(--gray-600)')
  }

  return resolveCssColor(getRouteDisplayColor(
    String(leg?.mode ?? '').toLowerCase(),
    leg?.routeColor ?? leg?.color,
  ))
}

function resolveStrokeWeight(leg) {
  return String(leg?.mode ?? '').toLowerCase() === 'walk' ? 5 : 6
}

function resolveCssColor(color) {
  if (typeof color !== 'string') {
    return '#2563eb'
  }

  const variableMatch = color.match(/^var\((--[^),]+)\)$/)
  if (!variableMatch) {
    return color
  }

  const resolvedColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variableMatch[1])
    .trim()

  return resolvedColor || color
}

function clearOverlays(overlaysRef) {
  overlaysRef.current.forEach((overlay) => overlay.setMap(null))
  overlaysRef.current = []
}
