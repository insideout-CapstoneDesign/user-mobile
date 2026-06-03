import styled from 'styled-components'

export const OverlayRoot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 18;
  width: min(100%, var(--layout-mobile-width));
  margin: 0 auto;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`

export const OverlayCardSlot = styled.div`
  width: 100%;
  padding: var(--space-20) var(--space-16) 0;
  display: flex;
  justify-content: center;
`
