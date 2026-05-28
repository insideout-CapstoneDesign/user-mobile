import doorIcon from '../../assets/icons/D_door.svg'
import hyphenIcon from '../../assets/icons/D_hyphen.svg'
import leftIcon from '../../assets/icons/D_left.svg'
import locateIcon from '../../assets/icons/MyLocate.svg'
import rightIcon from '../../assets/icons/D_right.svg'
import stairIcon from '../../assets/icons/D_stair.svg'
import straightIcon from '../../assets/icons/D_straight.svg'
import verticalIcon from '../../assets/icons/D_vertical.svg'
import {
  IconBubble,
  IconImage,
  PlainStepIcon,
} from './NavigationStepIcon.styles'

export default function NavigationStepIcon({ step, variant = 'plain' }) {
  const icon = getStepIcon(step)
  const tone = getStepTone(step)

  if (variant === 'bubble') {
    return <IconBubble $tone={tone}>{icon}</IconBubble>
  }

  return <PlainStepIcon $tone={tone}>{icon}</PlainStepIcon>
}

function getStepIcon(step = {}) {
  const normalizedText = `${step.instruction ?? ''} ${step.turnType ?? ''}`.toLowerCase()
  let src = hyphenIcon

  if (
    normalizedText.includes('도착') ||
    normalizedText.includes('출발') ||
    normalizedText.includes('현재 위치')
  ) {
    src = locateIcon
  } else if (normalizedText.includes('계단') || normalizedText.includes('stair')) {
    src = stairIcon
  } else if (
    normalizedText.includes('수직') ||
    normalizedText.includes('층') ||
    normalizedText.includes('엘리베이터') ||
    normalizedText.includes('vertical')
  ) {
    src = verticalIcon
  } else if (
    normalizedText.includes('출입구') ||
    normalizedText.includes('입구') ||
    normalizedText.includes('출구') ||
    normalizedText.includes('door') ||
    normalizedText.includes('entrance')
  ) {
    src = doorIcon
  } else if (normalizedText.includes('왼') || normalizedText.includes('left')) {
    src = leftIcon
  } else if (normalizedText.includes('오른') || normalizedText.includes('right')) {
    src = rightIcon
  } else if (
    normalizedText.includes('직진') ||
    normalizedText.includes('이동') ||
    normalizedText.includes('straight')
  ) {
    src = straightIcon
  }

  return <IconImage src={src} alt="" aria-hidden="true" />
}

function getStepTone(step = {}) {
  const text = String(step.instruction ?? '').toLowerCase()

  if (text.includes('도착')) return 'destination'
  if (text.includes('출발') || text.includes('현재 위치')) return 'origin'

  return 'default'
}
