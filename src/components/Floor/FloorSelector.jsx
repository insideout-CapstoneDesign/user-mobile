import 'react'
import {
  FloatingContainer,
  FloorInfo,
  ButtonGrid,
  SquareButton
} from './FloorSelector.styles'

export default function FloorSelector({ buildingName, floors, activeFloor, onSelect }) {
  return (
    <FloatingContainer>
      <FloorInfo>
        {buildingName} {activeFloor ? `· ${getFloorLabel(activeFloor)}` : ''}
      </FloorInfo>

      <ButtonGrid>
        {floors.map((floor) => (
          <SquareButton
            type="button"
            key={getFloorKey(floor)}
            $active={getFloorKey(activeFloor) === getFloorKey(floor)}
            onClick={() => onSelect(floor)}
          >
            {getFloorLabel(floor)}
          </SquareButton>
        ))}
      </ButtonGrid>
    </FloatingContainer>
  )
}

function getFloorKey(floor) {
  if (floor && typeof floor === 'object') {
    return floor.key ?? floor.id ?? floor.name
  }

  return floor
}

function getFloorLabel(floor) {
  if (floor && typeof floor === 'object') {
    return floor.label ?? floor.name ?? floor.floorName ?? floor.key
  }

  return floor
}
