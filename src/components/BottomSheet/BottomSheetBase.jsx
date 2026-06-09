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
  scrollableContent = true,
  dismissible = true,
}) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      detent={detent}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      disableDismiss={!dismissible}
    >
      <StyledSheetContainer>
        <Sheet.Header />
        <StyledSheetContent $scrollable={scrollableContent}>
          <SheetBody $scrollable={scrollableContent}>{children}</SheetBody>
        </StyledSheetContent>
      </StyledSheetContainer>
      {showBackdrop ? <StyledSheetBackdrop onTap={onClose} /> : null}
    </Sheet>
  )
}
