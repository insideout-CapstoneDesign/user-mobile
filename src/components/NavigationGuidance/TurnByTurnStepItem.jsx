import NavigationStepIcon from './NavigationStepIcon'
import {
  ListItem,
  ListItemContent,
  ListItemMeta,
  ListItemTitle,
} from './TurnByTurnList.styles'

export default function TurnByTurnStepItem({
  step,
  index,
  active,
  onSelect,
}) {
  const meta = [step.distanceText, step.durationText, step.floorName]
    .filter(Boolean)
    .join(' · ')

  return (
    <ListItem
      type="button"
      $active={active}
      onClick={() => onSelect?.(step, index)}
    >
      <NavigationStepIcon
        step={step}
        variant={isEndpointStep(step) ? 'bubble' : 'plain'}
      />
      <ListItemContent>
        <ListItemTitle>{step.instruction || '안내 메시지'}</ListItemTitle>
        {meta ? <ListItemMeta>{meta}</ListItemMeta> : null}
      </ListItemContent>
    </ListItem>
  )
}

function isEndpointStep(step = {}) {
  const text = String(step.instruction ?? '')

  return text.includes('도착') || text.includes('출발') || text.includes('현재 위치')
}
