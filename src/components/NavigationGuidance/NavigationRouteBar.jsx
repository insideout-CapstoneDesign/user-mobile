import {
  RouteBarRoot,
  RouteBarSegment,
  RouteBarWalkText,
  RouteLineBadge,
} from './NavigationRouteBar.styles'
import { formatMinutes } from '../../utils/navigationFormatters'
import { getRouteDisplayColor } from './routeColor'

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
  const minutesText = formatMinutes(safeSegment.minutes)
  const background = getRouteDisplayColor(
    type,
    safeSegment.routeColor ?? safeSegment.color,
  )

  if (type === 'walk') {
    return (
      <RouteBarSegment $weight={safeSegment.minutes} $bg={background}>
        {minutesText ? <RouteBarWalkText>{minutesText}</RouteBarWalkText> : null}
      </RouteBarSegment>
    )
  }

  if (type === 'indoor') {
    return (
      <RouteBarSegment $weight={safeSegment.minutes} $bg={background} $type={type}>
        <RouteLineBadge>실내이동</RouteLineBadge>
      </RouteBarSegment>
    )
  }

  return (
    <RouteBarSegment $weight={safeSegment.minutes} $bg={background} $type={type}>
      {safeSegment.line ? <RouteLineBadge>{safeSegment.line}</RouteLineBadge> : null}
      {minutesText ? <span>{minutesText}</span> : null}
    </RouteBarSegment>
  )
}

function getSegmentKey(segment, index) {
  return `${segment?.type ?? 'segment'}-${segment?.line ?? index}-${index}`
}
