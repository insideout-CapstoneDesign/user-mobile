import { useMemo } from 'react'
import {
  FloatingContainer,
  FloorInfo,
  ButtonGrid,
  SquareButton
} from './FloorSelector.styles'

export default function FloorSelector({ buildingName, floors, activeFloor, onSelect }) {
  const sortedFloors = useMemo(() => sortFloors(floors), [floors])

  return (
    <FloatingContainer>
      <FloorInfo>
        {buildingName} {activeFloor ? `· ${getFloorLabel(activeFloor)}` : ''}
      </FloorInfo>

      <ButtonGrid>
        {sortedFloors.map((floor) => (
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
    return floor.key ?? floor.id ?? floor.floorId ?? floor.name ?? floor.floorName
  }

  return floor
}

function getFloorLabel(floor) {
  if (floor && typeof floor === 'object') {
    return floor.label ?? floor.name ?? floor.floorName ?? floor.key
  }

  return floor
}

function sortFloors(floors = []) {
  return [...floors].sort((a, b) => {
    const floorA = getFloorOrder(a)
    const floorB = getFloorOrder(b)

    if (floorA === null && floorB === null) return 0
    if (floorA === null) return 1
    if (floorB === null) return -1

    return floorA - floorB
  })
}

function getFloorOrder(floor) {
  const explicitOrder = getExplicitFloorOrder(floor)

  if (explicitOrder !== null) {
    return explicitOrder
  }

  if (floor && typeof floor === 'object') {
    const labelOrder = [floor.label, floor.floorName, floor.name]
      .map(parseFloorOrder)
      .find((order) => order !== null)

    if (labelOrder !== undefined) {
      return labelOrder
    }

    return parseFloorLabelOrder(floor.key)
  }

  return parseFloorOrder(getFloorLabel(floor))
}

function getExplicitFloorOrder(floor) {
  if (!floor || typeof floor !== 'object') {
    return parseFloorOrder(floor)
  }

  const floorValue = floor.level ?? floor.floor ?? floor.floorNumber ?? floor.floorLevel ?? floor.floorNo

  return parseFloorOrder(floorValue)
}

function parseFloorLabelOrder(value) {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value).trim()
  if (!/[층f]|지하/i.test(text)) {
    return null
  }

  return parseFloorOrder(text)
}

function parseFloorOrder(value) {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value).trim()
  if (!text) {
    return null
  }

  const numericValue = Number(text)
  if (Number.isFinite(numericValue)) {
    return numericValue
  }

  const basementMatch = text.match(/(?:B|지하)\s*(\d+)/i)
  if (basementMatch) {
    return -Number(basementMatch[1])
  }

  const floorMatch = text.match(/(-?\d+)\s*(?:층|F)?/i)
  if (floorMatch) {
    return Number(floorMatch[1])
  }

  return null
}
