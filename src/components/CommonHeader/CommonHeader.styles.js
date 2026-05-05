import styled from 'styled-components'

export const HeaderContainer = styled.header`
  width: 100%;
  min-height: var(--size-56);
  padding: 0 var(--space-16);
  display: flex;
  align-items: center;
  position: ${({ $overlay }) => ($overlay ? 'absolute' : 'relative')};
  top: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  left: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  right: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  z-index: ${({ $overlay }) => ($overlay ? '10' : 'auto')};
  background: ${({ $variant }) =>
    $variant === 'routeInfo' ? 'var(--blue-700)' : 'var(--surface-0)'};
  border-bottom: ${({ $variant }) =>
    $variant === 'routeInfo' ? 'none' : 'var(--size-1) solid var(--gray-100)'};
`

export const IconButton = styled.button`
  width: var(--size-36);
  height: var(--size-36);
  border: none;
  background: transparent;
  color: ${({ $variant }) =>
    $variant === 'routeInfo' ? 'var(--text-inverse)' : 'var(--black-900)'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: var(--text-20);
  cursor: pointer;
`

export const HeaderCenter = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: ${({ $variant }) =>
    $variant === 'title' ? '0' : 'var(--space-8)'};
  padding-right: ${({ $variant }) =>
    $variant === 'search' ? '0' : 'var(--space-8)'};
`

export const HeaderTitle = styled.h1`
  margin: 0;
  color: var(--black-900);
  text-align: ${({ $variant }) =>
    $variant === 'title' ? 'left' : 'center'};
  font-size: var(--text-16);
  font-weight: var(--fw-semibold);
  line-height: var(--line-20);
`

export const HeaderRight = styled.div`
  width: ${({ $hasAction }) => ($hasAction ? 'var(--size-36)' : '0')};
  height: var(--size-36);
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
`

export const RouteInfoCenter = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-inverse);
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0 var(--space-8);
  cursor: pointer;
`

export const RouteInfoText = styled.span`
  font-size: var(--text-14);
  line-height: var(--line-20);
  font-weight: var(--fw-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const FloatingBackButton = styled.button`
  position: absolute;
  top: var(--space-16);
  left: var(--space-16);
  z-index: 10;
  width: var(--size-36);
  height: var(--size-36);
  border: none;
  border-radius: var(--radius-pill);
  background: var(--surface-0);
  box-shadow: var(--shadow-searchbar);
  color: var(--black-900);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`
