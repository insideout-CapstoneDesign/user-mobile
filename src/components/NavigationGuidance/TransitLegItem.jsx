import { FaChevronDown } from 'react-icons/fa'
import { normalizeRouteColor } from './routeColor'
import TransitTimelineIcon from './TransitTimelineIcon'
import {
  HiddenStop,
  HiddenStopList,
  LegBody,
  LegCard,
  LegMeta,
  LegName,
  LegStation,
  LegSubText,
  LegTitleRow,
  ToggleButton,
  WalkDetailText,
  WalkTitle,
} from './TransitTurnByTurnList.styles'

export default function TransitLegItem({
  leg,
  isFirst = false,
  isLast = false,
  expanded = false,
  onToggle,
}) {
  const isTransit = leg.type === 'bus' || leg.type === 'subway'
  const hiddenStops = leg.stops ?? []
  const color = normalizeRouteColor(leg.routeColor ?? leg.color)

  return (
    <LegCard $type={leg.type}>
      <TransitTimelineIcon
        leg={leg}
        color={color}
        isFirst={isFirst}
        isLast={isLast}
      />

      <LegBody>
        {leg.type === 'point' ? (
          <PointLegContent leg={leg} />
        ) : isTransit ? (
          <TransitLegContent
            leg={leg}
            hiddenStops={hiddenStops}
            expanded={expanded}
            onToggle={onToggle}
          />
        ) : (
          <WalkLegContent leg={leg} />
        )}
      </LegBody>
    </LegCard>
  )
}

function PointLegContent({ leg }) {
  return (
    <>
      <LegName>{leg.title}</LegName>
      {leg.detail ? <LegSubText>{leg.detail}</LegSubText> : null}
    </>
  )
}

function TransitLegContent({ leg, hiddenStops, expanded, onToggle }) {
  return (
    <>
      <LegTitleRow>
        <LegName>{leg.startName}</LegName>
        {leg.line ? <LegMeta>{leg.line}</LegMeta> : null}
      </LegTitleRow>
      {leg.startDetail ? <LegSubText>{leg.startDetail}</LegSubText> : null}

      <ToggleButton type="button" onClick={onToggle} $expanded={expanded}>
        {leg.stopCount ?? hiddenStops.length}개 {leg.type === 'bus' ? '정류장' : '역'} · {leg.durationText}
        <FaChevronDown size={14} />
      </ToggleButton>

      {expanded && hiddenStops.length > 0 ? (
        <HiddenStopList>
          {hiddenStops.map((stop, index) => (
            <HiddenStop key={`${leg.id}-${getStopLabel(stop)}-${index}`}>
              {getStopLabel(stop)}
            </HiddenStop>
          ))}
        </HiddenStopList>
      ) : null}

      <LegStation>{leg.endName}</LegStation>
      {leg.endDetail ? <LegSubText>{leg.endDetail}</LegSubText> : null}
    </>
  )
}

function WalkLegContent({ leg }) {
  return (
    <>
      <WalkTitle>{leg.title}</WalkTitle>
      {leg.detail ? <WalkDetailText>{leg.detail}</WalkDetailText> : null}
    </>
  )
}

function getStopLabel(stop) {
  if (stop && typeof stop === 'object') {
    return stop.name ?? stop.stationName ?? stop.stopName ?? stop.title ?? ''
  }

  return stop
}
