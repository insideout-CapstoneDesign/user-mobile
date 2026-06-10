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
  contentHeight,
  contentMaxHeight,
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
        <StyledSheetContent
          $scrollable={scrollableContent}
          $contentHeight={contentHeight}
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
      {showBackdrop ? <StyledSheetBackdrop onTap={onClose} /> : null}
    </Sheet>
  )
}
