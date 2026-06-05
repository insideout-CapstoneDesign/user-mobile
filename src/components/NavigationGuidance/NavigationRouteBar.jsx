import {
  RouteBarRoot,
  RouteBarSegment,
  RouteBarWalkText,
  RouteLineBadge,
} from './NavigationRouteBar.styles'
import { formatMinutes } from '../../utils/navigationFormatters'
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
  const minutesText = formatMinutes(safeSegment.minutes)
  const background = getSegmentBackground(type, color)

  if (type === 'walk') {
    return (
      <RouteBarSegment $weight={safeSegment.minutes} $bg={background}>
        {minutesText ? <RouteBarWalkText>{minutesText}</RouteBarWalkText> : null}
      </RouteBarSegment>
    )
  }

  return (
    <RouteBarSegment $weight={safeSegment.minutes} $bg={background}>
      {safeSegment.line ? <RouteLineBadge>{safeSegment.line}</RouteLineBadge> : null}
      {minutesText ? <span>{minutesText}</span> : null}
    </RouteBarSegment>
  )
}

function getSegmentKey(segment, index) {
  return `${segment?.type ?? 'segment'}-${segment?.line ?? index}-${index}`
}

function getSegmentBackground(type, color) {
  if (type === 'walk') return 'var(--gray-200)'
  if (color) return color
  if (type === 'bus' || type === 'campus') return 'var(--green-500)'
  if (type === 'subway') return 'var(--blue-900)'
  if (type === 'car') return 'var(--blue-500)'
  if (type === 'indoor') return 'var(--blue-600)'
  return 'var(--gray-500)'
}
