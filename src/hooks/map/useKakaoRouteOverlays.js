import { useEffect, useRef } from 'react'
import { getRouteDisplayColor } from '../../components/NavigationGuidance/routeColor'
import { isArrivalStep } from '../../utils/navigationStepTypes'

const ACTIVE_GUIDANCE_MAX_LEVEL = 2
const DESTINATION_EDGE_COLOR = '#dc2626'

export default function useKakaoRouteOverlays({
  map,
  routeLegs = [],
  activeStep = null,
  fitBounds = false,
}) {
  const overlaysRef = useRef([])
  const fittedRouteKeyRef = useRef(null)
  const routeKey = getRouteKey(routeLegs)

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

    const activeRouteLeg = findActiveRouteLeg(routeLegs, activeStep)
    const isDestinationEdge = shouldHighlightDestinationEdge(
      activeRouteLeg?.path,
      activeStep,
    )
    const activePathPoints = isDestinationEdge
      ? sliceDestinationEdge(activeRouteLeg?.path, activeStep?.pathEndIndex)
      : sliceActivePath(activeRouteLeg?.path, activeStep)
    const activePath = toLatLngPath(kakaoMaps, activePathPoints)
    if (activePath.length >= 2) {
      const activeColor = isDestinationEdge
        ? DESTINATION_EDGE_COLOR
        : resolveRouteColor(activeRouteLeg)
      if (isDestinationEdge) {
        const destinationOutline = new kakaoMaps.Polyline({
          map,
          path: activePath,
          strokeWeight: 15,
          strokeColor: 'rgba(255, 255, 255, 0.96)',
          strokeOpacity: 1,
          strokeStyle: 'solid',
          zIndex: 30,
        })
        const destinationLine = new kakaoMaps.Polyline({
          map,
          path: activePath,
          strokeWeight: 8,
          strokeColor: DESTINATION_EDGE_COLOR,
          strokeOpacity: 0.96,
          strokeStyle: 'solid',
          zIndex: 31,
        })
        overlaysRef.current.push(destinationOutline, destinationLine)
      }
      const activeMarker = createActiveNodeOverlay(
        kakaoMaps,
        isDestinationEdge ? activePath[activePath.length - 1] : activePath[0],
        activeColor,
        isDestinationEdge,
      )
      activeMarker.setMap(map)
      overlaysRef.current.push(activeMarker)
      panToActivePathCenter(map, kakaoMaps, activePath)
      zoomInForActiveGuidance(map)
    }

    if (fitBounds && hasBounds && fittedRouteKeyRef.current !== routeKey) {
      map.setBounds(bounds, 36, 80, 36, 36)
      zoomInAfterFit(map)
      fittedRouteKeyRef.current = routeKey
    }

    return () => clearOverlays(overlaysRef)
  }, [activeStep, fitBounds, map, routeKey, routeLegs])
}

function zoomInForActiveGuidance(map) {
  if (!map || typeof map.getLevel !== 'function' || typeof map.setLevel !== 'function') {
    return
  }

  const currentLevel = map.getLevel()
  if (typeof currentLevel !== 'number' || !Number.isFinite(currentLevel)) {
    return
  }

  if (currentLevel > ACTIVE_GUIDANCE_MAX_LEVEL) {
    map.setLevel(ACTIVE_GUIDANCE_MAX_LEVEL, { animate: true })
  }
}

function createActiveNodeOverlay(kakaoMaps, position, color, isDestination = false) {
  const marker = document.createElement('div')
  marker.style.width = '22px'
  marker.style.height = '22px'
  marker.style.borderRadius = '999px'
  marker.style.background = color
  marker.style.border = '4px solid #fff'
  marker.style.boxShadow = isDestination
    ? '0 0 0 8px rgba(220, 38, 38, 0.2), 0 4px 12px rgba(15, 23, 42, 0.24)'
    : '0 0 0 8px rgba(37, 99, 235, 0.18), 0 4px 12px rgba(15, 23, 42, 0.24)'
  marker.style.boxSizing = 'border-box'

  return new kakaoMaps.CustomOverlay({
    position,
    content: marker,
    xAnchor: 0.5,
    yAnchor: 0.5,
    zIndex: 20,
  })
}

function panToActivePathCenter(map, kakaoMaps, path) {
  if (!map || !kakaoMaps || !Array.isArray(path) || path.length === 0) {
    return
  }

  const center = getPathCenter(path)
  if (!center) {
    return
  }

  map.panTo(new kakaoMaps.LatLng(center.lat, center.lng))
}

function getPathCenter(path) {
  const positions = path
    .map((position) => ({
      lat: position.getLat?.(),
      lng: position.getLng?.(),
    }))
    .filter((point) =>
      typeof point.lat === 'number' &&
      Number.isFinite(point.lat) &&
      typeof point.lng === 'number' &&
      Number.isFinite(point.lng),
    )

  if (positions.length === 0) {
    return null
  }

  const total = positions.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  )

  return {
    lat: total.lat / positions.length,
    lng: total.lng / positions.length,
  }
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

function findActiveRouteLeg(routeLegs, activeStep) {
  if (!activeStep || !Array.isArray(routeLegs)) {
    return null
  }

  const activeSegmentId = activeStep.segmentId ?? activeStep.mapLegId
  const matchedLeg = routeLegs.find((leg) =>
    [leg?.id, leg?.segmentId, leg?.mapLegId].filter(Boolean).includes(activeSegmentId),
  )

  if (matchedLeg) {
    return matchedLeg
  }

  if (isArrivalStep(activeStep)) {
    return findLastRouteLegWithPath(routeLegs)
  }

  return null
}

function sliceActivePath(path, activeStep) {
  if (!Array.isArray(path) || !activeStep) {
    return []
  }

  const start = Number.isInteger(activeStep.pathStartIndex)
    ? activeStep.pathStartIndex
    : null
  const end = Number.isInteger(activeStep.pathEndIndex)
    ? activeStep.pathEndIndex
    : null

  if (isArrivalStep(activeStep)) {
    return sliceDestinationEdge(path, end)
  }

  if (start === null || end === null || start === end) {
    return []
  }

  const from = Math.max(Math.min(start, end), 0)
  const to = Math.min(Math.max(start, end), path.length - 1)
  return path.slice(from, to + 1)
}

function sliceDestinationEdge(path, preferredEndIndex = null) {
  if (!Array.isArray(path) || path.length < 2) {
    return []
  }

  const endIndex = Number.isInteger(preferredEndIndex)
    ? Math.max(Math.min(preferredEndIndex, path.length - 1), 1)
    : path.length - 1

  return path.slice(endIndex - 1, endIndex + 1)
}

function shouldHighlightDestinationEdge(path, activeStep) {
  if (!Array.isArray(path) || path.length < 2 || !activeStep) {
    return false
  }

  if (isArrivalStep(activeStep)) {
    return true
  }

  return Number.isInteger(activeStep.pathEndIndex) &&
    activeStep.pathEndIndex >= path.length - 1
}

function findLastRouteLegWithPath(routeLegs) {
  if (!Array.isArray(routeLegs)) {
    return null
  }

  for (let index = routeLegs.length - 1; index >= 0; index -= 1) {
    const path = routeLegs[index]?.path
    if (Array.isArray(path) && path.length >= 2) {
      return routeLegs[index]
    }
  }

  return null
}

function getRouteKey(routeLegs) {
  if (!Array.isArray(routeLegs) || routeLegs.length === 0) {
    return 'empty'
  }

  return routeLegs
    .map((leg) => {
      const path = Array.isArray(leg?.path) ? leg.path : []
      const first = path[0]
      const last = path[path.length - 1]

      return [
        leg?.id,
        path.length,
        first ? `${first.x},${first.y}` : '',
        last ? `${last.x},${last.y}` : '',
      ].join(':')
    })
    .join('|')
}

function zoomInAfterFit(map) {
  if (!map || typeof map.getLevel !== 'function' || typeof map.setLevel !== 'function') {
    return
  }

  const currentLevel = map.getLevel()
  if (typeof currentLevel !== 'number' || !Number.isFinite(currentLevel)) {
    return
  }

  map.setLevel(Math.max(currentLevel - 1, 1), { animate: false })
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
