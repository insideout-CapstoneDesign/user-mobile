import { useRef } from 'react'
import NavigationStepIcon from './NavigationStepIcon'
import {
  CardButton,
  CardContent,
  CardMeta,
  CardRoot,
  CardTitle,
  ProgressDot,
  ProgressRow,
} from './GuidanceStepCard.styles'

const SWIPE_THRESHOLD = 42

export default function GuidanceStepCard({
  step,
  activeIndex = 0,
  total = 0,
  onPrevious,
  onNext,
  onClick,
}) {
  const startXRef = useRef(null)
  const swipedRef = useRef(false)

  if (!step) {
    return null
  }

  const meta = [step.distanceText, step.durationText, step.floorName]
    .filter(Boolean)
    .join(' · ')

  const handlePointerDown = (event) => {
    startXRef.current = event.clientX
    swipedRef.current = false
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
        aria-label={`${activeIndex + 1}번째 안내 단계`}
      >
        <NavigationStepIcon step={step} variant="plain" />
        <CardContent>
          <CardTitle>{step.instruction || '안내 메시지'}</CardTitle>
          {meta ? <CardMeta>{meta}</CardMeta> : null}
        </CardContent>
      </CardButton>

      {total > 1 ? (
        <ProgressRow aria-hidden="true">
          {Array.from({ length: total }).map((_, index) => (
            <ProgressDot
              key={`step-progress-${index}`}
              $active={index === activeIndex}
            />
          ))}
        </ProgressRow>
      ) : null}
    </CardRoot>
  )
}
