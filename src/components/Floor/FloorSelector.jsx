// src/components/Floor/FloorSelector.jsx
import 'react'
import * as S from './FloorSelector.styles'

export default function FloorSelector({ buildingName, floors, activeFloor, onSelect }) {
  return (
    <S.FloatingContainer>
      <S.FloorInfo>
        {buildingName} {activeFloor}
      </S.FloorInfo>

      <S.ButtonGrid>
        {floors.map((floor) => (
          <S.SquareButton
            key={floor}
            $active={activeFloor === floor}
            onClick={() => onSelect(floor)}
          >
            {floor}
          </S.SquareButton>
        ))}
      </S.ButtonGrid>
    </S.FloatingContainer>
  )
}