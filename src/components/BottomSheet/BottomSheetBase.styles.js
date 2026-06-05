import styled from 'styled-components'
import { Sheet } from 'react-modal-sheet'

export const StyledSheetContainer = styled(Sheet.Container)`
  width: min(100vw, var(--layout-mobile-width));
  max-width: var(--layout-mobile-width);
  box-sizing: border-box;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-top-left-radius: var(--space-16);
  border-top-right-radius: var(--space-16);
  box-shadow: var(--shadow-bottom-sheet);
  overflow: hidden;
`

export const StyledSheetBackdrop = styled(Sheet.Backdrop)`
  background: var(--overlay-dim);
`

export const StyledSheetContent = styled(Sheet.Content)`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-16) var(--space-20);
  max-height: calc(100dvh - var(--sheet-handle-offset));
  overflow-y: ${({ $scrollable = true }) => ($scrollable ? 'auto' : 'hidden')};
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding-bottom: calc(var(--space-20) + env(safe-area-inset-bottom));
  min-height: 0;
  flex: 1 1 auto;
`

export const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  color: var(--gray-700);
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  min-height: 0;
  height: ${({ $scrollable = true }) => ($scrollable ? 'auto' : '100%')};
`
