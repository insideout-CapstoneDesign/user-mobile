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

  if (isBuildingExitStep(step, normalizedText)) {
    src = doorIcon
  } else if (isBuildingArrivalStep(step, normalizedText)) {
    src = buildingIcon
  } else if (
    normalizedText.includes('도착') ||
    normalizedText.includes('출발') ||
    normalizedText.includes('현재 위치')
  ) {
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
    isIndoorStep(step) &&
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
  const safeStep = step && typeof step === 'object' ? step : {}
  const mode = String(safeStep.mode ?? '').toUpperCase()
  return safeStep.type === 'indoor' || mode === 'INDOOR'
}

function isBuildingArrivalStep(step = {}, normalizedText = '') {
  const safeStep = step && typeof step === 'object' ? step : {}
  const mode = String(safeStep.mode ?? '').toUpperCase()
  return mode === 'BUILDING' || normalizedText.includes('건물 도착')
}

function isBuildingExitStep(step = {}, normalizedText = '') {
  const safeStep = step && typeof step === 'object' ? step : {}
  const mode = String(safeStep.mode ?? '').toUpperCase()
  return (
    normalizedText.includes('건물 출구') ||
    normalizedText.includes('로 나가기') ||
    (mode === 'INDOOR' && normalizedText.includes('나가기'))
  )
}

function getStepTone(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const text = String(safeStep.instruction ?? '').toLowerCase()

  if (isBuildingExitStep(step, text)) return 'destination'
  if (text.includes('도착') || text.includes('출구') || text.includes('나가기')) {
    return 'destination'
  }
  if (text.includes('출발') || text.includes('현재 위치')) return 'origin'

  return 'default'
}
