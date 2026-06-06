import CommonHeader from '../CommonHeader/CommonHeader'
import { isDistanceSummaryInstruction } from '../../utils/navigationStepFilters'
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
  const visibleSteps = steps.filter(shouldShowStep)

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

        {visibleSteps.map((step, index) => (
          <TurnByTurnStepItem
            key={step.id ?? `turn-step-${index}`}
            step={step}
            index={index}
            active={activeStepId === step.id}
            onSelect={onSelectStep}
          />
        ))}
      </ListBody>
    </ListRoot>
  )
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
