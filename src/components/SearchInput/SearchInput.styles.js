import styled, { css } from 'styled-components'

export const SearchInputWrapper = styled.div`
  width: 100%;
  min-height: var(--size-48);
  border-radius: ${({ $variant }) =>
    $variant === 'inline' ? 'var(--radius-10)' : 'var(--radius-pill)'};
  background: var(--surface-0);
  padding: var(--space-12) var(--space-16);
  display: inline-flex;
  align-items: center;
  gap: var(--space-12);

  ${({ $variant }) =>
    $variant === 'inline'
      ? css`
          border: var(--size-1) solid var(--gray-200);
          box-shadow: none;
        `
      : css`
          border: none;
          box-shadow: var(--shadow-searchbar);
        `}

  &:focus-within {
    border: var(--size-1) solid var(--blue-600);
    box-shadow: 0 0 0 var(--space-3) rgba(21, 93, 252, 0.16);
  }
`

export const SearchIconWrap = styled.span`
  width: var(--size-20);
  height: var(--size-20);
  color: var(--gray-400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

export const SearchField = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--black-900);
  font-family: var(--font-sans);
  font-size: var(--text-14);
  line-height: var(--line-20);

  &::placeholder {
    color: var(--gray-400);
  }

  &:focus-visible {
    outline: none;
  }
`
