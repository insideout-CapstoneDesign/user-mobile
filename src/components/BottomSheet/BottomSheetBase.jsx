import { Sheet } from 'react-modal-sheet'
import {
  SheetBody,
  StyledSheetBackdrop,
  StyledSheetContainer,
  StyledSheetContent,
} from './BottomSheetBase.styles'

export default function BottomSheetBase({
  isOpen,
  onClose,
  children,
  detent = 'content',
  snapPoints,
  initialSnap,
  showBackdrop = true,
}) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      detent={detent}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
    >
      <StyledSheetContainer>
        <Sheet.Header />
        <StyledSheetContent>
          <SheetBody>{children}</SheetBody>
        </StyledSheetContent>
      </StyledSheetContainer>
      {showBackdrop ? <StyledSheetBackdrop onTap={onClose} /> : null}
    </Sheet>
  )
}
