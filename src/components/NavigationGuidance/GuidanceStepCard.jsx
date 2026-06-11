import { useRef } from 'react'
import NavigationStepIcon from './NavigationStepIcon'
import {
  CardButton,
  CardContent,
  CardMeta,
  CardRoot,
  CardTitle,
} from './GuidanceStepCard.styles'

const SWIPE_THRESHOLD = 42

export default function GuidanceStepCard({
  step,
  steps = [],
  activeIndex = 0,
  onPrevious,
  onNext,
  onClick,
}) {
  const startXRef = useRef(null)
  const touchStartXRef = useRef(null)
  const swipedRef = useRef(false)
  const lastPointerSwipeAtRef = useRef(0)

  if (!step) {
    return null
  }

  const safeStep = step && typeof step === 'object' ? step : {}
  const meta = [safeStep.distanceText, safeStep.durationText, safeStep.floorName]
    .filter(Boolean)
    .join(' · ')
  const bubbleTone = getGuidanceBubbleTone(steps, activeIndex)

  const handlePointerDown = (event) => {
    startXRef.current = event.clientX
    swipedRef.current = false

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (startXRef.current === null) {
      return
    }

    const deltaX = event.clientX - startXRef.current
    startXRef.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return
    }

    swipedRef.current = true

    if (deltaX > 0) {
      onPrevious?.()
      lastPointerSwipeAtRef.current = Date.now()
      return
    }

    onNext?.()
    lastPointerSwipeAtRef.current = Date.now()
  }

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0]
    touchStartXRef.current =
      typeof touch?.clientX === 'number' ? touch.clientX : null
    swipedRef.current = false
  }

  const handleTouchEnd = (event) => {
    if (Date.now() - lastPointerSwipeAtRef.current < 400) {
      touchStartXRef.current = null
      return
    }

    const touch = event.changedTouches?.[0]
    if (touchStartXRef.current === null || typeof touch?.clientX !== 'number') {
      touchStartXRef.current = null
      return
    }

    const deltaX = touch.clientX - touchStartXRef.current
    touchStartXRef.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return
    }

    swipedRef.current = true

    if (deltaX > 0) {
      onPrevious?.()
      return
    }

    onNext?.()
  }

  return (
    <CardRoot>
      <CardButton
        type="button"
        onClick={() => {
          if (swipedRef.current) {
            swipedRef.current = false
            return
          }

          onClick?.()
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          startXRef.current = null
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartXRef.current = null
        }}
        aria-label={`${activeIndex + 1}번째 안내 단계`}
      >
        <NavigationStepIcon
          step={safeStep}
          variant={bubbleTone ? 'bubble' : 'plain'}
          tone={bubbleTone ?? 'default'}
        />
        <CardContent>
          <CardTitle>{safeStep.instruction || '안내 메시지'}</CardTitle>
          {meta ? <CardMeta>{meta}</CardMeta> : null}
        </CardContent>
      </CardButton>
    </CardRoot>
  )
}

function getGuidanceBubbleTone(steps, activeIndex) {
  const visibleSteps = Array.isArray(steps)
    ? steps.filter((item) => item && typeof item === 'object')
    : []

  if (visibleSteps.length === 0) {
    return null
  }

  const safeIndex = Math.max(
    Math.min(Number.isInteger(activeIndex) ? activeIndex : 0, visibleSteps.length - 1),
    0,
  )

  if (safeIndex === 0 && isOriginStep(visibleSteps[0])) {
    return 'origin'
  }

  if (safeIndex === visibleSteps.length - 1) {
    return 'destination'
  }

  const currentIsIndoor = isIndoorStep(visibleSteps[safeIndex])
  const nextIsIndoor = isIndoorStep(visibleSteps[safeIndex + 1])

  return currentIsIndoor !== nextIsIndoor ? 'destination' : null
}

function isOriginStep(step = {}) {
  const text = String(step?.instruction ?? '')
  return text.includes('출발') || text.includes('현재 위치')
}

function isIndoorStep(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const mode = String(safeStep.mode ?? '').toUpperCase()
  return safeStep.type === 'indoor' || mode === 'INDOOR' || Boolean(safeStep.floorId)
}
