import { IoMapOutline, IoNavigateOutline, IoPersonOutline } from 'react-icons/io5'
import {
  BottomNavButton,
  BottomNavContainer,
  BottomNavList,
} from './BottomNav.styles'

const defaultItems = [
  { key: 'map', label: '지도', icon: IoMapOutline },
  { key: 'navigation', label: '길찾기', icon: IoNavigateOutline },
  { key: 'my', label: '마이', icon: IoPersonOutline },
]

export default function BottomNav({ items = defaultItems, currentKey = 'map', onChange }) {
  return (
    <BottomNavContainer aria-label="하단 네비게이션">
      <BottomNavList>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = currentKey === item.key

          return (
            <BottomNavButton
              key={item.key}
              type="button"
              $active={isActive}
              onClick={() => onChange?.(item.key, item)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </BottomNavButton>
          )
        })}
      </BottomNavList>
    </BottomNavContainer>
  )
}
