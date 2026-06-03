import { useState } from 'react'
import { FaBus, FaCarAlt, FaChevronRight, FaSubway } from 'react-icons/fa'
import Button from '../../Button/Button'
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
  RouteStepConnector,
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

export default function BottomSheetRouteOptions({
  options = [],
  mode = 'transit',
  selectedOptionId: controlledSelectedOptionId,
  onSelectOption,
  onStartNavigation,
}) {
  const [internalSelectedOptionId, setInternalSelectedOptionId] = useState(
    () => options.find((option) => option.active)?.id ?? options[0]?.id ?? null,
  )
  const defaultOption = options.find((option) => option.active) ?? options[0] ?? null
  const selectedOptionId = controlledSelectedOptionId ?? internalSelectedOptionId
  const selectedOption =
    options.find((option) => option.id === selectedOptionId) ?? defaultOption

  const renderStepIcon = (step) => {
    if (step.type === 'bus') return <FaBus size={12} />
    if (step.type === 'subway') return <FaSubway size={12} />
    if (step.type === 'car') return <FaCarAlt size={12} />
    return <RoutePointDot />
  }

  const stepColorByType = (type) => {
    if (type === 'bus') return 'var(--green-500)'
    if (type === 'subway') return 'var(--blue-900)'
    if (type === 'car') return 'var(--blue-500)'
    if (type === 'walk') return 'var(--gray-600)'
    return 'var(--gray-400)'
  }

  return (
    <TypeContainer>
      <RouteOptionsBody>
        <RouteSectionTitle>경로 옵션</RouteSectionTitle>

        <RouteListViewport>
          <RouteList>
            {options.map((option) => (
              <RouteCard
                key={option.id}
                type="button"
                $active={selectedOption?.id === option.id}
                onClick={() => {
                  setInternalSelectedOptionId(option.id)
                  onSelectOption?.(option)
                }}
              >
                {mode === 'transit' ? (
                  <>
                    <RouteCardHead>
                      <RouteTimeText>{option.totalTime}</RouteTimeText>
                      <FaChevronRight color="var(--gray-400)" size={14} />
                    </RouteCardHead>

                    <RouteBarSlot>
                      <NavigationRouteBar segments={option.segments} />
                    </RouteBarSlot>

                    <RouteSteps>
                      {option.steps.map((step, index) => (
                        <RouteStepItem key={`${option.id}-step-${index}`}>
                          <RouteStepIconColumn $color={stepColorByType(step.type)}>
                            {renderStepIcon(step)}
                            {index < option.steps.length - 1 ? <RouteStepConnector /> : null}
                          </RouteStepIconColumn>
                          <RouteStepContent>
                            <RouteStepTitle>{step.name}</RouteStepTitle>
                            {step.sub ? <RouteStepSub>{step.sub}</RouteStepSub> : null}
                          </RouteStepContent>
                        </RouteStepItem>
                      ))}
                    </RouteSteps>
                  </>
                ) : (
                  <>
                    <RouteCardHead>
                      <div>
                        <RouteOptionName>{option.name}</RouteOptionName>
                        <RouteOptionMetaRow>
                          {option.time ? <RouteOptionTime>{option.time}</RouteOptionTime> : null}
                          {option.distance ? (
                            <RouteOptionDistance>{option.distance}</RouteOptionDistance>
                          ) : null}
                        </RouteOptionMetaRow>
                        {option.extraInfo ? (
                          <RouteOptionExtra>{option.extraInfo}</RouteOptionExtra>
                        ) : null}
                      </div>
                      <FaChevronRight color="var(--gray-400)" size={14} />
                    </RouteCardHead>
                  </>
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
