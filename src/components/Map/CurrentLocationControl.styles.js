import styled from 'styled-components'

export const CurrentLocationButton = styled.button`
  position: absolute;
  right: var(--space-16);
  bottom: calc(var(--size-56) + var(--space-16) + env(safe-area-inset-bottom));
  z-index: 11;
  width: var(--size-48);
  height: var(--size-48);
  border: var(--size-1) solid var(--gray-200);
  border-radius: var(--radius-pill);
  background: var(--surface-0);
  color: var(--black-900);
  box-shadow: var(--shadow-searchbar);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

export const GeoMessage = styled.p`
  position: absolute;
  right: var(--space-16);
  bottom: calc(
    var(--size-56) + var(--space-16) + var(--size-48) + var(--space-8) +
      env(safe-area-inset-bottom)
  );
  z-index: 11;
  margin: 0;
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-8);
  background: var(--surface-0);
  color: var(--red-500);
  font-family: var(--font-sans);
  font-size: var(--text-12);
  line-height: var(--line-16);
  box-shadow: var(--shadow-searchbar);
`
