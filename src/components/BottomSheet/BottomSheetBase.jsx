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
      <StyledSheetBackdrop onTap={onClose} />
    </Sheet>
  )
}
