import buildingIcon from '../../assets/icons/building.svg'
import crosswalkIcon from '../../assets/icons/D_crosswalk.svg'
import doorIcon from '../../assets/icons/door.svg'
import hyphenIcon from '../../assets/icons/D_hyphen.svg'
import elevatorIcon from '../../assets/icons/elevator.svg'
import leftIcon from '../../assets/icons/leftSign.svg'
import locateIcon from '../../assets/icons/MyLocate.svg'
import rightIcon from '../../assets/icons/rightSign.svg'
import stairIcon from '../../assets/icons/stairs.svg'
import straightIcon from '../../assets/icons/straightSign.svg'
import {
  IconBubble,
  IconImage,
  PlainStepIcon,
} from './NavigationStepIcon.styles'
import { isArrivalStep } from '../../utils/navigationStepTypes'

export default function NavigationStepIcon({ step, variant = 'plain', tone: toneOverride }) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const icon = getStepIcon(safeStep)
  const tone = toneOverride ?? getStepTone(safeStep)

  if (variant === 'bubble') {
    return <IconBubble $tone={tone}>{icon}</IconBubble>
  }

  return <PlainStepIcon $tone={tone}>{icon}</PlainStepIcon>
}

function getStepIcon(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const normalizedText = `${safeStep.instruction ?? ''} ${safeStep.turnType ?? ''}`.toLowerCase()
  let src = hyphenIcon

  if (isBuildingExitStep(safeStep, normalizedText)) {
    src = doorIcon
  } else if (isBuildingArrivalStep(safeStep)) {
    src = buildingIcon
  } else if (isArrivalStep(safeStep) || isOriginStep(normalizedText)) {
    src = locateIcon
  } else if (
    normalizedText.includes('엘리베이터') ||
    normalizedText.includes('엘레베이터') ||
    normalizedText.includes('elevator')
  ) {
    src = elevatorIcon
  } else if (normalizedText.includes('계단') || normalizedText.includes('stair')) {
    src = stairIcon
  } else if (normalizedText.includes('횡단보도') || normalizedText.includes('crosswalk')) {
    src = crosswalkIcon
  } else if (
    isIndoorStep(safeStep) &&
    (normalizedText.includes('출입구') ||
      normalizedText.includes('건물 입구') ||
      normalizedText.includes('입구 진입') ||
      normalizedText.includes('door') ||
      normalizedText.includes('entrance'))
  ) {
    src = doorIcon
  } else if (normalizedText.includes('좌회전') || normalizedText.includes('left')) {
    src = leftIcon
  } else if (normalizedText.includes('우회전') || normalizedText.includes('right')) {
    src = rightIcon
  } else if (
    normalizedText.includes('직진') ||
    normalizedText.includes('이동') ||
    normalizedText.includes('따라') ||
    normalizedText.includes('straight')
  ) {
    src = straightIcon
  }

  return <IconImage src={src} alt="" aria-hidden="true" />
}

function isIndoorStep(step = {}) {
  const mode = String(step.mode ?? '').toUpperCase()
  return step.type === 'indoor' || mode === 'INDOOR'
}

function isBuildingArrivalStep(step = {}) {
  const mode = String(step.mode ?? '').toUpperCase()
  return mode === 'BUILDING' || step.stepType === 'BUILDING_ARRIVAL'
}

function isBuildingExitStep(step = {}, normalizedText = '') {
  const mode = String(step.mode ?? '').toUpperCase()
  return (
    normalizedText.includes('건물 출구') ||
    normalizedText.includes('로 나가기') ||
    (mode === 'INDOOR' && normalizedText.includes('나가기'))
  )
}

function getStepTone(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const text = String(safeStep.instruction ?? '').toLowerCase()

  if (isBuildingExitStep(safeStep, text) || isArrivalStep(safeStep)) {
    return 'destination'
  }
  if (isOriginStep(text)) return 'origin'

  return 'default'
}

function isOriginStep(text) {
  return text.includes('출발') || text.includes('현재 위치')
}
