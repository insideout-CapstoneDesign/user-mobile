import { forwardRef } from 'react'
import NavigationStepIcon from './NavigationStepIcon'
import {
  ListItem,
  ListItemContent,
  ListItemTitle,
} from './TurnByTurnList.styles'

const TurnByTurnStepItem = forwardRef(function TurnByTurnStepItem({
  step,
  index,
  active,
  originBubble,
  destinationBubble,
  onSelect,
}, ref) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const bubbleTone = getBubbleTone({ originBubble, destinationBubble })

  return (
    <ListItem
      ref={ref}
      type="button"
      $active={active}
      onClick={() => onSelect?.(safeStep, index)}
    >
      <NavigationStepIcon
        step={safeStep}
        variant={bubbleTone ? 'bubble' : 'plain'}
        tone={bubbleTone ?? 'default'}
      />
      <ListItemContent>
        <ListItemTitle>{safeStep.instruction || '안내 메시지'}</ListItemTitle>
      </ListItemContent>
    </ListItem>
  )
})

export default TurnByTurnStepItem

function getBubbleTone({ originBubble, destinationBubble }) {
  if (originBubble) return 'origin'
  if (destinationBubble) return 'destination'
  return null
}
