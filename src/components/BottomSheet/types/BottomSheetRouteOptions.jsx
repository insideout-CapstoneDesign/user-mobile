import { useState } from 'react'
import { FaBus, FaCarAlt, FaChevronRight, FaSubway } from 'react-icons/fa'
import Button from '../../Button/Button'
import DurationWithIndoorSuffix from '../../NavigationGuidance/DurationWithIndoorSuffix'
import NavigationRouteBar from '../../NavigationGuidance/NavigationRouteBar'
import {
  RouteCard,
  RouteCardHead,
  RouteEmptyText,
  RouteList,
  RouteBarSlot,
  RouteOptionDistance,
  RouteOptionExtra,
  RouteOptionMetaRow,
  RouteOptionName,
  RouteOptionTime,
  RouteOptionsBody,
  RoutePointDot,
  RouteListViewport,
  RouteSectionTitle,
  RouteStepContent,
  RouteStepIconColumn,
  RouteStepItem,
  RouteStepSub,
  RouteSteps,
  RouteStepTitle,
  RouteTimeText,
  StickyActionSection,
  TypeContainer,
} from './BottomSheetTypes.styles'

const STEP_COLOR_BY_TYPE = {
  bus: 'var(--green-500)',
  subway: 'var(--blue-900)',
  car: 'var(--blue-500)',
  walk: 'var(--gray-600)',
}

export default function BottomSheetRouteOptions({
  options = [],
  mode = 'transit',
  selectedOptionId: controlledSelectedOptionId,
  onSelectOption,
  onStartNavigation,
  maxHeight,
}) {
  const [internalSelectedOptionId, setInternalSelectedOptionId] = useState(
    () => options.find((option) => option.active)?.id ?? options[0]?.id ?? null,
  )
  const defaultOption = options.find((option) => option.active) ?? options[0] ?? null
  const selectedOptionId = controlledSelectedOptionId ?? internalSelectedOptionId
  const selectedOption =
    options.find((option) => option.id === selectedOptionId) ?? defaultOption

  const handleSelectOption = (option) => {
    setInternalSelectedOptionId(option.id)
    onSelectOption?.(option)
  }

  return (
    <TypeContainer $maxHeight={maxHeight}>
      <RouteOptionsBody $maxHeight={maxHeight}>
        <RouteSectionTitle>경로 옵션</RouteSectionTitle>

        <RouteListViewport>
          <RouteList>
            {options.map((option) => (
              <RouteCard
                key={option.id}
                type="button"
                $active={selectedOption?.id === option.id}
                onClick={() => handleSelectOption(option)}
              >
                {mode === 'transit' ? (
                  <TransitRouteOption option={option} />
                ) : (
                  <StandardRouteOption option={option} />
                )}
              </RouteCard>
            ))}
          </RouteList>

          {!options.length ? (
            <RouteEmptyText>표시할 경로 옵션이 없습니다.</RouteEmptyText>
          ) : null}
        </RouteListViewport>

        <StickyActionSection>
          <Button
            variant="primary"
            disabled={!selectedOption}
            onClick={() => onStartNavigation?.(selectedOption)}
          >
            안내 시작
          </Button>
        </StickyActionSection>
      </RouteOptionsBody>
    </TypeContainer>
  )
}

function TransitRouteOption({ option }) {
  return (
    <>
      <RouteCardHead>
        <RouteTimeText>
          <DurationWithIndoorSuffix value={option.totalTime} />
        </RouteTimeText>
        <RouteChevron />
      </RouteCardHead>

      <RouteBarSlot>
        <NavigationRouteBar segments={option.segments} />
      </RouteBarSlot>

      <RouteSteps>
        {option.steps.filter(isStepObject).map((step, index) => (
          <RouteStep
            key={`${option.id}-step-${index}`}
            step={step}
          />
        ))}
      </RouteSteps>
    </>
  )
}

function StandardRouteOption({ option }) {
  return (
    <RouteCardHead>
      <div>
        <RouteOptionName>{option.name}</RouteOptionName>
        <RouteOptionMetaRow>
          {option.time ? (
            <RouteOptionTime>
              <DurationWithIndoorSuffix value={option.time} />
            </RouteOptionTime>
          ) : null}
          {option.distance ? (
            <RouteOptionDistance>{option.distance}</RouteOptionDistance>
          ) : null}
        </RouteOptionMetaRow>
        {option.extraInfo ? (
          <RouteOptionExtra>{option.extraInfo}</RouteOptionExtra>
        ) : null}
      </div>
      <RouteChevron />
    </RouteCardHead>
  )
}

function RouteStep({ step }) {
  const safeStep = step && typeof step === 'object' ? step : {}

  return (
    <RouteStepItem>
      <RouteStepIconColumn $color={getStepColor(safeStep.type)}>
        <RouteStepIcon type={safeStep.type} />
      </RouteStepIconColumn>
      <RouteStepContent>
        <RouteStepTitle>{safeStep.name ?? '경로 안내'}</RouteStepTitle>
        {safeStep.sub ? <RouteStepSub>{safeStep.sub}</RouteStepSub> : null}
      </RouteStepContent>
    </RouteStepItem>
  )
}

function isStepObject(step) {
  return step && typeof step === 'object'
}

function RouteStepIcon({ type }) {
  if (type === 'bus') return <FaBus size={12} />
  if (type === 'subway') return <FaSubway size={12} />
  if (type === 'car') return <FaCarAlt size={12} />
  return <RoutePointDot />
}

function RouteChevron() {
  return <FaChevronRight color="var(--gray-400)" size={14} />
}

function getStepColor(type) {
  return STEP_COLOR_BY_TYPE[type] ?? 'var(--gray-400)'
}
