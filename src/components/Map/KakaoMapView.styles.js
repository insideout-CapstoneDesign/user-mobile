import styled from 'styled-components'

export const MapViewport = styled.div`
  width: 100%;
  height: 100%;
`

export const MapState = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: var(--surface-50);
  color: var(--gray-600);
  font-family: var(--font-sans);
  font-size: var(--text-14);
`
