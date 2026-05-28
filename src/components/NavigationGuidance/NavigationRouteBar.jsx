import {
  RouteBarRoot,
  RouteBarSegment,
  RouteBarWalkText,
  RouteLineBadge,
} from './NavigationRouteBar.styles'
import { normalizeRouteColor } from './routeColor'

export default function NavigationRouteBar({ segments = [] }) {
  return (
    <RouteBarRoot>
      {segments.map((segment, index) => (
        <RouteSegment
          key={`${segment.type ?? 'segment'}-${segment.line ?? index}-${index}`}
          segment={segment}
        />
      ))}
    </RouteBarRoot>
  )
}

function RouteSegment({ segment }) {
  const type = segment.type ?? 'walk'
  const color = normalizeRouteColor(segment.routeColor ?? segment.color)
  const backgroundByType = {
    walk: 'var(--surface-50)',
    bus: color || 'var(--green-500)',
    subway: color || 'var(--blue-900)',
    car: color || 'var(--blue-500)',
  }

  if (type === 'walk') {
    return (
      <RouteBarSegment $weight={segment.minutes} $bg={backgroundByType.walk}>
        <RouteBarWalkText>{segment.minutes}분</RouteBarWalkText>
      </RouteBarSegment>
    )
  }

  return (
    <RouteBarSegment $weight={segment.minutes} $bg={backgroundByType[type]}>
      {segment.line ? <RouteLineBadge>{segment.line}</RouteLineBadge> : null}
      <span>{segment.minutes}분</span>
    </RouteBarSegment>
  )
}
