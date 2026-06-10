import { useEffect, useRef } from 'react'
import CommonHeader from '../CommonHeader/CommonHeader'
import { isDistanceSummaryInstruction } from '../../utils/navigationStepFilters'
import DurationWithIndoorSuffix from './DurationWithIndoorSuffix'
import TurnByTurnStepItem from './TurnByTurnStepItem'
import {
  DestinationText,
  Divider,
  ListBody,
  ListRoot,
  RouteMetric,
  RouteMetricLabel,
  RouteMetricRow,
  RouteMetricSub,
  RouteMetricTime,
  RouteSectionDivider,
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
            <RouteMetricTime>
              <DurationWithIndoorSuffix value={route?.time ?? route?.totalTime ?? '20분'} />
            </RouteMetricTime>
            {route?.distance ? <DestinationText>{route.distance}</DestinationText> : null}
          </RouteMetricRow>
          {route?.extraInfo ? <RouteMetricSub>{route.extraInfo}</RouteMetricSub> : null}
        </RouteMetric>

        <Divider />

        {visibleSteps.map(({ step, originalIndex }, index) => (
          <FragmentWithRouteDivider
            key={step.id ?? `turn-step-${index}`}
            dividerLabel={getRouteSectionDividerLabel(visibleSteps, index)}
          >
            <TurnByTurnStepItem
              ref={activeStepId === step.id ? activeItemRef : null}
              step={step}
              index={originalIndex}
              active={activeStepId === step.id}
              onSelect={onSelectStep}
            />
          </FragmentWithRouteDivider>
        ))}
      </ListBody>
    </ListRoot>
  )
}

function FragmentWithRouteDivider({ dividerLabel, children }) {
  return (
    <>
      {dividerLabel ? <RouteSectionDivider>{dividerLabel}</RouteSectionDivider> : null}
      {children}
    </>
  )
}

function getRouteSectionDividerLabel(visibleSteps, index) {
  if (index <= 0) {
    return null
  }

  const currentStep = visibleSteps[index]?.step
  const previousStep = visibleSteps[index - 1]?.step
  const currentIsIndoor = isIndoorStep(currentStep)
  const previousIsIndoor = isIndoorStep(previousStep)

  if (currentIsIndoor && !previousIsIndoor) {
    return '실내 진입'
  }

  if (!currentIsIndoor && previousIsIndoor) {
    return '실외로 이동'
  }

  return null
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
