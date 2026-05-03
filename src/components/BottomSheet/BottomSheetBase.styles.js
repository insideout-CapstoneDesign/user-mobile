import styled from 'styled-components'
import { Sheet } from 'react-modal-sheet'

export const StyledSheetContainer = styled(Sheet.Container)`
  width: min(100vw, 375px);
  max-width: 375px;
  box-sizing: border-box;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
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
  padding: 0 16px 20px;
  max-height: calc(100dvh - 28px);
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
`

export const SheetHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

export const SheetTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--black-900);
`

export const SheetCloseButton = styled.button`
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  cursor: pointer;
`

export const SheetBody = styled.div`
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
`
