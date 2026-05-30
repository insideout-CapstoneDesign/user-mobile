import styled from 'styled-components'

export const FloorplanRoot = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--surface-50);
`

export const FloorplanStage = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-12);
`

export const FloorplanCanvas = styled.div`
  position: relative;
  width: min(100%, calc((100dvh - var(--space-24)) * ${({ $ratio }) => $ratio || 1}));
  max-height: calc(100dvh - var(--space-24));
  aspect-ratio: ${({ $ratio }) => $ratio || 1};
  background: var(--surface-0);
  box-shadow: var(--shadow-bottom-sheet);
  overflow: hidden;
`

export const FloorplanImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
`

export const FloorplanSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

export const FloorplanState = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-24);
  background: var(--surface-50);
  color: var(--gray-600);
  font-family: var(--font-sans);
  font-size: var(--text-14);
  text-align: center;
`

export const FloorplanBadge = styled.div`
  position: absolute;
  left: var(--space-16);
  bottom: calc(12.5rem + env(safe-area-inset-bottom));
  z-index: 2;
  max-width: calc(100% - var(--space-32));
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-8);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-bottom-sheet);
  color: var(--gray-700);
  font-family: var(--font-sans);
  font-size: var(--text-13);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
