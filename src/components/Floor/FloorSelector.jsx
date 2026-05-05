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
        {buildingName} {activeFloor ? `· ${activeFloor}` : ''}
      </FloorInfo>

      <ButtonGrid>
        {floors.map((floor) => (
          <SquareButton
            type="button"
            key={floor}
            $active={activeFloor === floor}
            onClick={() => onSelect(floor)}
          >
            {floor}
          </SquareButton>
        ))}
      </ButtonGrid>
    </FloatingContainer>
  )
}