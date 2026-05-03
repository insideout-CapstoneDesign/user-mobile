import Button from '../Button/Button'
import { ActionBar, ActionCell } from './BottomSheetActionBar.styles'

export default function BottomSheetActionBar({
  leftLabel = '취소',
  rightLabel = '확인',
  leftVariant = 'outline',
  rightVariant = 'primary',
  onLeftClick,
  onRightClick,
}) {
  return (
    <ActionBar>
      <ActionCell>
        <Button variant={leftVariant} onClick={onLeftClick}>
          {leftLabel}
        </Button>
      </ActionCell>
      <ActionCell>
        <Button variant={rightVariant} onClick={onRightClick}>
          {rightLabel}
        </Button>
      </ActionCell>
    </ActionBar>
  )
}
