import { useEffect, useRef } from 'react'
import CommonHeader from '../CommonHeader/CommonHeader'
import { isDistanceSummaryInstruction } from '../../utils/navigationStepFilters'
import { isIndoorStep } from '../../utils/navigationStepTypes'
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
    .filter(({ step }) => step && typeof step === 'object')
    .filter(({ step }) => shouldShowStep(step))
  const originBubbleIndexes = getOriginBubbleIndexes(visibleSteps)
  const destinationBubbleIndexes = getDestinationBubbleIndexes(visibleSteps)

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
              originBubble={originBubbleIndexes.has(index)}
              destinationBubble={destinationBubbleIndexes.has(index)}
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

function getOriginBubbleIndexes(visibleSteps) {
  const indexes = new Set()
  const firstStep = visibleSteps[0]?.step

  if (isOriginStep(firstStep)) {
    indexes.add(0)
  }

  return indexes
}

function getDestinationBubbleIndexes(visibleSteps) {
  const indexes = new Set()
  const lastIndex = visibleSteps.length - 1

  if (lastIndex < 0) {
    return indexes
  }

  indexes.add(lastIndex)

  for (let index = 0; index < lastIndex; index += 1) {
    const currentIsIndoor = isIndoorStep(visibleSteps[index]?.step)
    const nextIsIndoor = isIndoorStep(visibleSteps[index + 1]?.step)

    if (currentIsIndoor !== nextIsIndoor) {
      indexes.add(index)
    }
  }

  return indexes
}

function isOriginStep(step = {}) {
  const text = String(step?.instruction ?? '')
  return text.includes('출발') || text.includes('현재 위치')
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

function shouldShowStep(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}

  return !isMetaOnlyStep(safeStep) && !isDistanceSummaryStep(safeStep)
}

function isMetaOnlyStep(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const instruction = String(safeStep.instruction ?? '').trim()
  const hasMeta = [safeStep.distanceText, safeStep.durationText, safeStep.floorName].some(Boolean)

  return !instruction && hasMeta
}

function isDistanceSummaryStep(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}

  return isDistanceSummaryInstruction(safeStep)
}
