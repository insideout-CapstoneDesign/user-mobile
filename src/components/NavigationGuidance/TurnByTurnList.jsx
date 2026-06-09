import { useEffect, useRef } from 'react'
import CommonHeader from '../CommonHeader/CommonHeader'
import { isDistanceSummaryInstruction } from '../../utils/navigationStepFilters'
import TurnByTurnStepItem from './TurnByTurnStepItem'
import {
  DestinationText,
  Divider,
  IndoorEntryDivider,
  ListBody,
  ListRoot,
  RouteMetric,
  RouteMetricLabel,
  RouteMetricRow,
  RouteMetricSub,
  RouteMetricTime,
} from './TurnByTurnList.styles'

export default function TurnByTurnList({
  origin = '현재 위치',
  destination = '목적지',
  route,
  steps = [],
  activeStepId,
  onBack,
  onClose,
  onSelectStep,
}) {
  const activeItemRef = useRef(null)
  const visibleSteps = steps
    .map((step, index) => ({ step, originalIndex: index }))
    .filter(({ step }) => shouldShowStep(step))

  useEffect(() => {
    if (!activeStepId || !activeItemRef.current) {
      return
    }

    activeItemRef.current.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }, [activeStepId])

  return (
    <ListRoot>
      <CommonHeader
        variant="routeInfo"
        origin={origin}
        destination={destination}
        onBack={onBack}
        onClose={onClose}
      />

      <ListBody>
        <RouteMetric>
          <RouteMetricLabel>최단거리</RouteMetricLabel>
          <RouteMetricRow>
            <RouteMetricTime>{route?.time ?? route?.totalTime ?? '20분'}</RouteMetricTime>
            {route?.distance ? <DestinationText>{route.distance}</DestinationText> : null}
          </RouteMetricRow>
          {route?.extraInfo ? <RouteMetricSub>{route.extraInfo}</RouteMetricSub> : null}
        </RouteMetric>

        <Divider />

        {visibleSteps.map(({ step, originalIndex }, index) => (
          <FragmentWithIndoorDivider
            key={step.id ?? `turn-step-${index}`}
            showDivider={shouldShowIndoorEntryDivider(visibleSteps, index)}
          >
            <TurnByTurnStepItem
              ref={activeStepId === step.id ? activeItemRef : null}
              step={step}
              index={originalIndex}
              active={activeStepId === step.id}
              onSelect={onSelectStep}
            />
          </FragmentWithIndoorDivider>
        ))}
      </ListBody>
    </ListRoot>
  )
}

function FragmentWithIndoorDivider({ showDivider, children }) {
  return (
    <>
      {showDivider ? <IndoorEntryDivider>실내 진입</IndoorEntryDivider> : null}
      {children}
    </>
  )
}

function shouldShowIndoorEntryDivider(visibleSteps, index) {
  if (index <= 0) {
    return false
  }

  const currentStep = visibleSteps[index]?.step
  const previousStep = visibleSteps[index - 1]?.step

  return isIndoorEntryStep(currentStep) && !isIndoorStep(previousStep)
}

function isIndoorEntryStep(step = {}) {
  const instruction = String(step.instruction ?? '')
  return instruction.includes('입구 진입') || isIndoorStep(step)
}

function isIndoorStep(step = {}) {
  const mode = String(step.mode ?? '').toUpperCase()
  return step.type === 'indoor' || mode === 'INDOOR' || Boolean(step.floorId)
}

function shouldShowStep(step = {}) {
  return !isMetaOnlyStep(step) && !isDistanceSummaryStep(step)
}

function isMetaOnlyStep(step = {}) {
  const instruction = String(step.instruction ?? '').trim()
  const hasMeta = [step.distanceText, step.durationText, step.floorName].some(Boolean)

  return !instruction && hasMeta
}

function isDistanceSummaryStep(step = {}) {
  return isDistanceSummaryInstruction(step.instruction)
}
