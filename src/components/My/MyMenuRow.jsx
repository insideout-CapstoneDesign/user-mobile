import { IoChevronForward } from 'react-icons/io5'
import {
  MenuRowButton,
  MenuRowIconWrap,
  MenuRowLabel,
  MenuRowLeft,
  MenuRowRight,
} from './MyMenuRow.styles'

export default function MyMenuRow({
  icon: Icon,
  label,
  danger = false,
  onClick,
  showChevron = true,
}) {
  return (
    <MenuRowButton type="button" onClick={onClick}>
      <MenuRowLeft>
        {Icon ? (
          <MenuRowIconWrap>
            <Icon size={20} />
          </MenuRowIconWrap>
        ) : null}
        <MenuRowLabel $danger={danger}>{label}</MenuRowLabel>
      </MenuRowLeft>

      {showChevron ? (
        <MenuRowRight>
          <IoChevronForward size={20} />
        </MenuRowRight>
      ) : null}
    </MenuRowButton>
  )
}
