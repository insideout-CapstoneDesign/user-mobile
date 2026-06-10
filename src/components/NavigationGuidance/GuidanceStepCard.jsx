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
        <NavigationStepIcon step={safeStep} variant="plain" />
        <CardContent>
          <CardTitle>{safeStep.instruction || '안내 메시지'}</CardTitle>
          {meta ? <CardMeta>{meta}</CardMeta> : null}
        </CardContent>
      </CardButton>
    </CardRoot>
  )
}
