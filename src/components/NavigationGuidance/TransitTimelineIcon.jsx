import { FaBus, FaSubway } from 'react-icons/fa'
import walkIcon from '../../assets/icons/D_walk.svg'
import locateIcon from '../../assets/icons/MyLocate.svg'
import {
  LegConnector,
  LegIcon,
  LegTimeline,
} from './TransitTurnByTurnList.styles'

export default function TransitTimelineIcon({
  leg,
  color,
  isFirst = false,
  isLast = false,
}) {
  return (
    <LegTimeline>
      <LegIcon $type={leg.type} $color={color} $tone={leg.tone}>
        {leg.type === 'bus' ? <FaBus size={14} /> : null}
        {leg.type === 'subway' ? <FaSubway size={14} /> : null}
        {leg.type === 'walk' ? <img src={walkIcon} alt="" aria-hidden="true" /> : null}
        {leg.type === 'point' ? <img src={locateIcon} alt="" aria-hidden="true" /> : null}
      </LegIcon>
      {!isLast ? (
        <LegConnector $type={leg.type} $color={color} $isFirst={isFirst} />
      ) : null}
    </LegTimeline>
  )
}
