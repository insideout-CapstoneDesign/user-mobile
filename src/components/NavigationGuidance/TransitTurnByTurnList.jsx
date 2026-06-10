import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import CommonHeader from '../CommonHeader/CommonHeader'
import NavigationRouteBar from './NavigationRouteBar'
import DurationWithIndoorSuffix from './DurationWithIndoorSuffix'
import TransitLegItem from './TransitLegItem'
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
import {
  IndoorDividerButton,
  IndoorDividerLabel,
  IndoorStepList,
  RouteBarSection,
  TransitDetailList,
} from './TransitTurnByTurnList.styles'

export default function TransitTurnByTurnList({
  origin = '현재 위치',
  destination = '목적지',
  route,
  legs = [],
  activeStepId,
  indoorBuildingName,
  onBack,
  onClose,
  onSelectLeg,
  onSelectStep,
}) {
  const [expandedLegIds, setExpandedLegIds] = useState(() => new Set())
  const [indoorExpanded, setIndoorExpanded] = useState(false)
  const rawLegs = Array.isArray(route?.raw?.legs) ? route.raw.legs : []
  const startsIndoor = isIndoorRawLeg(rawLegs[0])
  const endsIndoor = !startsIndoor && rawLegs.some(isIndoorRawLeg)
  const firstOutdoorLegIndex = findFirstOutdoorLegIndex(rawLegs)
  const firstIndoorLegIndex = findFirstIndoorLegIndex(rawLegs)
  const outdoorLegs = legs.filter((leg) => {
    if (leg?.type === 'point') return true
    return !isIndoorDisplayLeg(leg)
  })
  const visibleLegs = endsIndoor
    ? withoutDestinationPoint(outdoorLegs)
    : startsIndoor
      ? withoutOriginPoint(outdoorLegs)
      : outdoorLegs
  const arrivalPointLeg = endsIndoor
    ? buildBuildingArrivalLeg(rawLegs, indoorBuildingName, destination)
    : null
  const entryIndoorSteps = endsIndoor
    ? getStepsFromLegIndex(route, firstIndoorLegIndex)
    : []
  const exitIndoorSteps = startsIndoor
    ? getStepsBeforeLegIndex(route, firstOutdoorLegIndex)
    : []
  const visibleEntryIndoorSteps = entryIndoorSteps.filter(isStepObject)
  const visibleExitIndoorSteps = exitIndoorSteps.filter(isStepObject)

  const toggleLeg = (legId) => {
    setExpandedLegIds((current) => {
      const next = new Set(current)

      if (next.has(legId)) {
        next.delete(legId)
      } else {
        next.add(legId)
      }

      return next
    })
  }

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
          <RouteMetricLabel>{route?.name ?? '최단거리'}</RouteMetricLabel>
          <RouteMetricRow>
            <RouteMetricTime>
              <DurationWithIndoorSuffix value={route?.time ?? route?.totalTime ?? '35분'} />
            </RouteMetricTime>
            {route?.distance ? <DestinationText>{route.distance}</DestinationText> : null}
          </RouteMetricRow>
          {route?.extraInfo ? <RouteMetricSub>{route.extraInfo}</RouteMetricSub> : null}
        </RouteMetric>

        {route?.segments?.length ? (
          <RouteBarSection>
            <NavigationRouteBar segments={route.segments} />
          </RouteBarSection>
        ) : null}

        <Divider />

        <TransitDetailList>
          {startsIndoor && visibleExitIndoorSteps.length > 0 ? (
            <>
              <IndoorStepList>
                {visibleExitIndoorSteps.map((step, index) => (
                  <TurnByTurnStepItem
                    key={step.id ?? `exit-indoor-step-${index}`}
                    step={step}
                    index={getStepOriginalIndex(route, step)}
                    active={activeStepId === step.id}
                    originBubble={index === 0}
                    destinationBubble={false}
                    onSelect={onSelectStep}
                  />
                ))}
              </IndoorStepList>
              <IndoorDividerLabel>실외로 이동</IndoorDividerLabel>
            </>
          ) : null}

          {visibleLegs.map((leg, index) => {
            const legKey = getLegKey(leg, index)

            return (
              <TransitLegItem
                key={legKey}
                leg={leg}
                isFirst={index === 0}
                isLast={index === legs.length - 1}
                expanded={expandedLegIds.has(legKey)}
                onToggle={() => toggleLeg(legKey)}
                onSelect={() => onSelectLeg?.(leg)}
              />
            )
          })}

          {arrivalPointLeg ? (
            <TransitLegItem
              leg={arrivalPointLeg}
              isFirst={false}
              isLast={visibleEntryIndoorSteps.length === 0}
            />
          ) : null}

          {visibleEntryIndoorSteps.length > 0 ? (
            <>
              <IndoorDividerButton
                type="button"
                onClick={() => setIndoorExpanded((current) => !current)}
                $expanded={indoorExpanded}
              >
                <span>실내 진입</span>
                <FaChevronDown size={14} />
              </IndoorDividerButton>

              {indoorExpanded ? (
                <IndoorStepList>
                  {visibleEntryIndoorSteps.map((step, index) => (
                    <TurnByTurnStepItem
                      key={step.id ?? `entry-indoor-step-${index}`}
                      step={step}
                      index={getStepOriginalIndex(route, step)}
                      active={activeStepId === step.id}
                      originBubble={index === 0}
                      destinationBubble={index === visibleEntryIndoorSteps.length - 1}
                      onSelect={onSelectStep}
                    />
                  ))}
                </IndoorStepList>
              ) : null}
            </>
          ) : null}
        </TransitDetailList>
      </ListBody>
    </ListRoot>
  )
}

function getLegKey(leg, index) {
  return leg?.id ?? `transit-leg-${index}`
}

function isStepObject(step) {
  return step && typeof step === 'object'
}

function isIndoorRawLeg(leg) {
  const mode = String(leg?.mode ?? '').toUpperCase()
  return mode === 'INDOOR' || mode === 'CAMPUS'
}

function isIndoorDisplayLeg(leg) {
  return leg?.type === 'indoor' || leg?.type === 'campus'
}

function findFirstOutdoorLegIndex(rawLegs) {
  return rawLegs.findIndex((leg) => !isIndoorRawLeg(leg))
}

function findFirstIndoorLegIndex(rawLegs) {
  return rawLegs.findIndex(isIndoorRawLeg)
}

function withoutDestinationPoint(legs) {
  const lastIndex = legs.length - 1

  return legs.filter((leg, index) => !(index === lastIndex && leg?.type === 'point'))
}

function withoutOriginPoint(legs) {
  return legs.filter((leg, index) => !(index === 0 && leg?.type === 'point'))
}

function buildBuildingArrivalLeg(rawLegs, indoorBuildingName, fallbackDestination) {
  const indoorLegIndex = findFirstIndoorLegIndex(rawLegs)
  const indoorLeg = indoorLegIndex >= 0 ? rawLegs[indoorLegIndex] : null
  const placeName =
    fallbackDestination ??
    indoorLeg?.startName ??
    '건물'
  const name = buildBuildingArrivalName(indoorBuildingName, placeName)

  return {
    id: 'transit-building-arrival',
    type: 'building',
    tone: 'destination',
    title: `${name} 도착`,
  }
}

function buildBuildingArrivalName(buildingName, placeName) {
  const safeBuildingName = String(buildingName ?? '').trim()
  const safePlaceName = String(placeName ?? '').trim()

  if (!safeBuildingName) return safePlaceName || '건물'
  if (!safePlaceName || safeBuildingName.includes(safePlaceName)) {
    return safeBuildingName
  }
  if (safePlaceName.includes(safeBuildingName)) {
    return safePlaceName
  }

  return `${safeBuildingName} ${safePlaceName}`
}

function getStepsFromLegIndex(route, legIndex) {
  if (legIndex < 0) return []

  return getTurnByTurnSteps(route).filter((step) => step?.legIndex >= legIndex)
}

function getStepsBeforeLegIndex(route, legIndex) {
  if (legIndex < 0) return getTurnByTurnSteps(route)

  return getTurnByTurnSteps(route).filter((step) => step?.legIndex < legIndex)
}

function getTurnByTurnSteps(route) {
  return Array.isArray(route?.turnByTurnSteps) ? route.turnByTurnSteps : []
}

function getStepOriginalIndex(route, step) {
  const index = getTurnByTurnSteps(route).findIndex((item) => item?.id === step?.id)

  return index >= 0 ? index : step?.stepIndex ?? 0
}
