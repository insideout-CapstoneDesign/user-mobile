import styled from 'styled-components'

export const MenuRowButton = styled.button`
  width: 100%;
  min-height: 49px;
  padding: var(--space-12) 0;
  border: none;
  border-bottom: var(--size-1) solid var(--gray-100);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-sans);
  cursor: pointer;
`

export const MenuRowLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-12);
  min-width: 0;
`

export const MenuRowLabel = styled.span`
  color: ${({ $danger }) => ($danger ? 'var(--red-500)' : 'var(--black-950)')};
  font-size: var(--text-16);
  line-height: var(--line-24);
  font-weight: ${({ $danger }) => ($danger ? 'var(--fw-medium)' : '400')};
`

export const MenuRowRight = styled.span`
  color: var(--gray-400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export const MenuRowIconWrap = styled.span`
  width: var(--size-20);
  height: var(--size-20);
  color: var(--black-950);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`
