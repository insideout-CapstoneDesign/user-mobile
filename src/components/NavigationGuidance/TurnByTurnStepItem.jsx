import NavigationStepIcon from './NavigationStepIcon'
import {
  ListItem,
  ListItemContent,
  ListItemTitle,
} from './TurnByTurnList.styles'

export default function TurnByTurnStepItem({
  step,
  index,
  active,
  onSelect,
}) {
  const safeStep = step && typeof step === 'object' ? step : {}

  return (
    <ListItem
      type="button"
      $active={active}
      onClick={() => onSelect?.(safeStep, index)}
    >
      <NavigationStepIcon
        step={safeStep}
        variant={isEndpointStep(safeStep) ? 'bubble' : 'plain'}
      />
      <ListItemContent>
        <ListItemTitle>{safeStep.instruction || '안내 메시지'}</ListItemTitle>
      </ListItemContent>
    </ListItem>
  )
}

function isEndpointStep(step = {}) {
  const text = String(step.instruction ?? '')

  return text.includes('도착') || text.includes('출발') || text.includes('현재 위치')
}
