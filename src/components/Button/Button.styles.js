// src/components/Button/Button.styles.js
import styled, { css } from 'styled-components'

const variantStyles = {
  primary: css`
    background: var(--blue-600);
    color: var(--text-inverse);
    border: none;
  `,
  outline: css`
    background: var(--surface-0);
    color: var(--black-1000);
    border: var(--size-1) solid var(--gray-200);
  `,
  danger: css`
    background: var(--red-500);
    color: var(--text-inverse);
    border: none;
  `,
}

export const StyledButton = styled.button.attrs({ type: 'button' })`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: var(--size-48);
  padding: 0 var(--space-12);
  border-radius: var(--radius-10);
  font-family: var(--font-sans);
  font-size: var(--text-16);
  font-weight: var(--fw-semibold);
  transition: all 0.2s ease;
  cursor: pointer;

  ${({ $variant }) => variantStyles[$variant] || variantStyles.primary}

  &:disabled {
    background: var(--gray-400);
    color: var(--text-inverse);
    border: none;
    cursor: not-allowed;
  }
`
