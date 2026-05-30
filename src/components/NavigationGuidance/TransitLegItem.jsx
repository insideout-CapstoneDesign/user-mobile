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
  const safeLeg = leg && typeof leg === 'object' ? leg : {}
  const type = safeLeg.type ?? 'walk'
  const displayLeg = { ...safeLeg, type }
  const isTransit = type === 'bus' || type === 'subway'
  const hiddenStops = Array.isArray(safeLeg.stops) ? safeLeg.stops : []
  const color = normalizeRouteColor(safeLeg.routeColor ?? safeLeg.color)

  return (
    <LegCard $type={type}>
      <TransitTimelineIcon
        leg={displayLeg}
        color={color}
        isFirst={isFirst}
        isLast={isLast}
      />

      <LegBody>
        {type === 'point' ? (
          <PointLegContent leg={displayLeg} />
        ) : isTransit ? (
          <TransitLegContent
            leg={displayLeg}
            hiddenStops={hiddenStops}
            expanded={expanded}
            onToggle={onToggle}
          />
        ) : (
          <WalkLegContent leg={displayLeg} />
        )}
      </LegBody>
    </LegCard>
  )
}

function PointLegContent({ leg }) {
  return (
    <>
      <LegName>{leg.title ?? '위치 안내'}</LegName>
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
            <HiddenStop key={`${leg.id ?? 'transit-leg'}-${getStopLabel(stop)}-${index}`}>
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
      <WalkTitle>{leg.title ?? '도보 이동'}</WalkTitle>
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
