import { useState } from 'react'
import CommonHeader from '../CommonHeader/CommonHeader'
import NavigationRouteBar from './NavigationRouteBar'
import TransitLegItem from './TransitLegItem'
import {
  DestinationText,
  Divider,
  ListBody,
  ListRoot,
  RouteMetric,
  RouteMetricLabel,
  RouteMetricRow,
  RouteMetricSub,
  RouteMetricTime,
} from './TurnByTurnList.styles'
import {
  RouteBarSection,
  TransitDetailList,
} from './TransitTurnByTurnList.styles'

export default function TransitTurnByTurnList({
  origin = '현재 위치',
  destination = '목적지',
  route,
  legs = [],
  onBack,
  onClose,
}) {
  const [expandedLegIds, setExpandedLegIds] = useState(() => new Set())

  const toggleLeg = (legId) => {
    setExpandedLegIds((current) => {
      const next = new Set(current)

      if (next.has(legId)) {
        next.delete(legId)
      } else {
        next.add(legId)
      }

      return next
    })
  }

  return (
    <ListRoot>
      <CommonHeader
        variant="routeInfo"
        origin={origin}
        destination={destination}
        onBack={onBack}
        onClose={onClose}
      />

      <ListBody>
        <RouteMetric>
          <RouteMetricLabel>{route?.name ?? '최단거리'}</RouteMetricLabel>
          <RouteMetricRow>
            <RouteMetricTime>{route?.time ?? route?.totalTime ?? '35분'}</RouteMetricTime>
            {route?.distance ? <DestinationText>{route.distance}</DestinationText> : null}
          </RouteMetricRow>
          {route?.extraInfo ? <RouteMetricSub>{route.extraInfo}</RouteMetricSub> : null}
        </RouteMetric>

        {route?.segments?.length ? (
          <RouteBarSection>
            <NavigationRouteBar segments={route.segments} />
          </RouteBarSection>
        ) : null}

        <Divider />

        <TransitDetailList>
          {legs.map((leg, index) => {
            const legKey = getLegKey(leg, index)

            return (
              <TransitLegItem
                key={legKey}
                leg={leg}
                isFirst={index === 0}
                isLast={index === legs.length - 1}
                expanded={expandedLegIds.has(legKey)}
                onToggle={() => toggleLeg(legKey)}
              />
            )
          })}
        </TransitDetailList>
      </ListBody>
    </ListRoot>
  )
}

function getLegKey(leg, index) {
  return leg?.id ?? `transit-leg-${index}`
}
