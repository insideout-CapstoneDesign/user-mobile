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
  contentMaxHeight,
}) {
  const handleClose = () => {
    if (dismissible) {
      onClose?.()
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      detent={detent}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      disableDismiss={!dismissible}
    >
      <StyledSheetContainer>
        <Sheet.Header />
        <StyledSheetContent
          $scrollable={scrollableContent}
          $contentMaxHeight={contentMaxHeight}
          disableDrag={!scrollableContent}
          disableScroll={!scrollableContent}
        >
          <SheetBody
            $scrollable={scrollableContent}
            $bounded={Boolean(contentMaxHeight)}
          >
            {children}
          </SheetBody>
        </StyledSheetContent>
      </StyledSheetContainer>
      {showBackdrop ? <StyledSheetBackdrop onTap={handleClose} /> : null}
    </Sheet>
  )
}
