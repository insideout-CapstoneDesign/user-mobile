import {
  RouteBarRoot,
  RouteBarSegment,
  RouteBarWalkText,
  RouteLineBadge,
} from './NavigationRouteBar.styles'
import { normalizeRouteColor } from './routeColor'

export default function NavigationRouteBar({ segments = [] }) {
  const safeSegments = Array.isArray(segments) ? segments : []

  return (
    <RouteBarRoot>
      {safeSegments.map((segment, index) => (
        <RouteSegment
          key={getSegmentKey(segment, index)}
          segment={segment}
        />
      ))}
    </RouteBarRoot>
  )
}

function RouteSegment({ segment }) {
  const safeSegment = segment && typeof segment === 'object' ? segment : {}
  const type = safeSegment.type ?? 'walk'
  const color = normalizeRouteColor(safeSegment.routeColor ?? safeSegment.color)
  const minutesText = formatSegmentMinutes(safeSegment.minutes)
  const backgroundByType = {
    walk: 'var(--surface-50)',
    bus: color || 'var(--green-500)',
    subway: color || 'var(--blue-900)',
    car: color || 'var(--blue-500)',
    indoor: color || 'var(--blue-600)',
    campus: color || 'var(--green-500)',
    point: color || 'var(--gray-500)',
  }

  if (type === 'walk') {
    return (
      <RouteBarSegment $weight={safeSegment.minutes} $bg={backgroundByType.walk}>
        {minutesText ? <RouteBarWalkText>{minutesText}</RouteBarWalkText> : null}
      </RouteBarSegment>
    )
  }

  return (
    <RouteBarSegment $weight={safeSegment.minutes} $bg={backgroundByType[type]}>
      {safeSegment.line ? <RouteLineBadge>{safeSegment.line}</RouteLineBadge> : null}
      {minutesText ? <span>{minutesText}</span> : null}
    </RouteBarSegment>
  )
}

function getSegmentKey(segment, index) {
  return `${segment?.type ?? 'segment'}-${segment?.line ?? index}-${index}`
}

function formatSegmentMinutes(minutes) {
  return typeof minutes === 'number' ? `${minutes}분` : null
}
