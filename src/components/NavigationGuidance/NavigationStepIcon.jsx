import buildingIcon from '../../assets/icons/building.svg'
import crosswalkIcon from '../../assets/icons/D_crosswalk.svg'
import doorIcon from '../../assets/icons/door.svg'
import hyphenIcon from '../../assets/icons/D_hyphen.svg'
import elevatorIcon from '../../assets/icons/elevator.svg'
import escalatorIcon from '../../assets/icons/escalator.svg'
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
import { isArrivalStep, isIndoorStep } from '../../utils/navigationStepTypes'

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
  } else if (isElevatorVerticalMove(normalizedText)) {
    src = elevatorIcon
  } else if (isEscalatorVerticalMove(normalizedText)) {
    src = escalatorIcon
  } else if (isStairVerticalMove(normalizedText)) {
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

function isBuildingArrivalStep(step = {}) {
  const mode = String(step.mode ?? '').toUpperCase()
  return mode === 'BUILDING' || step.stepType === 'BUILDING_ARRIVAL'
}

function isBuildingExitStep(step = {}, normalizedText = '') {
  const mode = String(step.mode ?? '').toUpperCase()
  return (
    normalizedText.includes('건물 출구') ||
    normalizedText.includes('로 나가기') ||
    (isIndoorStep(step) && mode !== 'BUILDING' && normalizedText.includes('나가기'))
  )
}

function isElevatorVerticalMove(text) {
  return (
    hasAnyText(text, ['엘리베이터', '엘레베이터', 'elevator']) &&
    isVerticalMoveInstruction(text)
  )
}

function isStairVerticalMove(text) {
  return hasAnyText(text, ['계단', 'stair', 'stairs']) && isVerticalMoveInstruction(text)
}

function isEscalatorVerticalMove(text) {
  return hasAnyText(text, ['에스컬레이터', 'escalator']) && isVerticalMoveInstruction(text)
}

function isVerticalMoveInstruction(text) {
  return (
    /(?:지하\s*)?\d+\s*(?:층|f)\s*(?:으로|로)?\s*(?:이동|올라|내려|가|진입)/i.test(text) ||
    /(?:층|floor)\s*(?:이동|변경|올라|내려|상승|하강)/i.test(text) ||
    /(?:타고|이용(?:해|하여)?).*(?:이동|올라|내려|상승|하강|층|floor|\d+\s*f)/i.test(text) ||
    /(?:올라가|내려가|올라오|내려오)/i.test(text)
  )
}

function hasAnyText(text, needles) {
  return needles.some((needle) => text.includes(needle.toLowerCase()))
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
