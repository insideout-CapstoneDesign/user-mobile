import { useState } from 'react'
import { FaBus, FaCarAlt, FaChevronRight, FaSubway } from 'react-icons/fa'
import Button from '../../Button/Button'
import {
  RouteBar,
  RouteBarSegment,
  RouteCard,
  RouteCardHead,
  RouteEmptyText,
  RouteLineBadge,
  RouteList,
  RouteOptionDistance,
  RouteOptionExtra,
  RouteOptionMetaRow,
  RouteOptionName,
  RouteOptionTime,
  RoutePointDot,
  RouteSectionTitle,
  RouteStepConnector,
  RouteStepContent,
  RouteStepIconColumn,
  RouteStepItem,
  RouteStepSub,
  RouteSteps,
  RouteStepTitle,
  RouteTimeText,
  RouteBarWalkText,
  StickyActionSection,
  TypeContainer,
} from './BottomSheetTypes.styles'

export default function BottomSheetRouteOptions({
  options = [],
  mode = 'transit',
  onSelectOption,
  onStartNavigation,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(
    () => options.find((option) => option.active)?.id ?? options[0]?.id ?? null,
  )
  const selectedOption =
    options.find((option) => option.id === selectedOptionId) ?? null

  const renderSegment = (segment, key) => {
    const backgroundByType = {
      walk: 'var(--surface-50)',
      bus: segment.color || 'var(--green-500)',
      subway: segment.color || 'var(--blue-900)',
      car: segment.color || 'var(--blue-500)',
    }

    if (segment.type === 'walk') {
      return (
        <RouteBarSegment key={key} $weight={segment.minutes} $bg={backgroundByType.walk}>
          <RouteBarWalkText>{segment.minutes}분</RouteBarWalkText>
        </RouteBarSegment>
      )
    }

    return (
      <RouteBarSegment
        key={key}
        $weight={segment.minutes}
        $bg={backgroundByType[segment.type]}
      >
        {segment.type === 'bus' ? <FaBus size={10} /> : null}
        {segment.type === 'subway' ? <FaSubway size={10} /> : null}
        {segment.type === 'car' ? <FaCarAlt size={10} /> : null}
        {segment.line ? <RouteLineBadge>{segment.line}</RouteLineBadge> : null}
        <span>{segment.minutes}분</span>
      </RouteBarSegment>
    )
  }

  const renderStepIcon = (step) => {
    if (step.type === 'bus') return <FaBus size={12} />
    if (step.type === 'subway') return <FaSubway size={12} />
    if (step.type === 'car') return <FaCarAlt size={12} />
    if (step.type === 'walk') return <RoutePointDot />
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
      <RouteSectionTitle>경로 옵션</RouteSectionTitle>

      <RouteList>
        {options.map((option) => (
          <RouteCard
            key={option.id}
            type="button"
            $active={selectedOptionId === option.id}
            onClick={() => {
              setSelectedOptionId(option.id)
              onSelectOption?.(option)
            }}
          >
            {mode === 'transit' ? (
              <>
                <RouteCardHead>
                  <RouteTimeText>{option.totalTime}</RouteTimeText>
                  <FaChevronRight color="var(--gray-400)" size={14} />
                </RouteCardHead>

                <RouteBar>
                  {option.segments.map((segment, index) =>
                    renderSegment(segment, `${option.id}-segment-${index}`),
                  )}
                </RouteBar>

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
                      <RouteOptionTime>{option.time}</RouteOptionTime>
                      <RouteOptionDistance>{option.distance}</RouteOptionDistance>
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

      <StickyActionSection>
        <Button
          variant="primary"
          disabled={!selectedOption}
          onClick={() => onStartNavigation?.(selectedOption)}
        >
          안내 시작
        </Button>
      </StickyActionSection>
    </TypeContainer>
  )
}
