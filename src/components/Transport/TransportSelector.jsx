import 'react'
import { Container, TabItem } from './TransportSelector.styles'
import CarIcon from '../../assets/icons/car.svg'
import BusIcon from '../../assets/icons/bus.svg'
import WalkIcon from '../../assets/icons/walk.svg'

export default function TransportSelector({ activeMode, onSelect }) {
  const modes = [
    { id: 'car', label: '자동차', icon: CarIcon },
    { id: 'transit', label: '대중교통', icon: BusIcon },
    { id: 'walk', label: '도보', icon: WalkIcon },
  ];

  return (
    <Container>
      {modes.map((mode) => (
        <TabItem 
          key={mode.id}
          as="button"
          type="button"
          $active={activeMode === mode.id}
          onClick={() => onSelect(mode.id)}
        >
          <img src={mode.icon} alt={mode.label} />
          <span>{mode.label}</span>
        </TabItem>
      ))}
    </Container>
  )
}