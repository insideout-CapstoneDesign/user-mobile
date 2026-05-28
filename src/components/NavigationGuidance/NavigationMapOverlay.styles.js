import styled from 'styled-components'

export const OverlayRoot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 18;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`

export const OverlayCardSlot = styled.div`
  padding: var(--space-20) var(--space-16) 0;
`
