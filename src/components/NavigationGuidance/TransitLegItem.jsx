import { FaChevronDown } from 'react-icons/fa'
import { getTransitStopName } from '../../utils/transitStopMapper'
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
  const stopUnit = leg.type === 'bus' ? '정류장' : '역'
  const stopCount = leg.stopCount ?? hiddenStops.length + 1
  const metaText = [stopCount ? `${stopCount}개${stopUnit}` : null, leg.durationText]
    .filter(Boolean)
    .join(' · ')
  const canToggleStops = hiddenStops.length > 0

  return (
    <>
      <LegTitleRow>
        <LegName>{leg.startName}</LegName>
        {leg.line ? <LegMeta>{leg.line}</LegMeta> : null}
      </LegTitleRow>
      {leg.startDetail ? <LegSubText>{leg.startDetail}</LegSubText> : null}

      {canToggleStops ? (
        <ToggleButton type="button" onClick={onToggle} $expanded={expanded}>
          {metaText}
          <FaChevronDown size={14} />
        </ToggleButton>
      ) : metaText ? (
        <LegSubText>{metaText}</LegSubText>
      ) : null}

      {expanded && canToggleStops ? (
        <HiddenStopList>
          {hiddenStops.map((stop, index) => (
            <HiddenStop
              key={`${leg.id ?? 'transit-leg'}-${getTransitStopName(stop)}-${index}`}
            >
              {getTransitStopName(stop)}
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
