import {
  RouteCard,
  RouteCardDescription,
  RouteCardTitle,
  RouteList,
  TypeContainer,
} from './BottomSheetTypes.styles'

export default function BottomSheetRouteOptions({
  options = [],
  onSelectOption,
}) {
  return (
    <TypeContainer>
      <RouteList>
        {options.map((option) => (
          <RouteCard
            key={option.id ?? option.label}
            type="button"
            onClick={() => onSelectOption?.(option)}
          >
            <RouteCardTitle>{option.label}</RouteCardTitle>
            {option.description ? (
              <RouteCardDescription>{option.description}</RouteCardDescription>
            ) : null}
          </RouteCard>
        ))}
      </RouteList>
    </TypeContainer>
  )
}
