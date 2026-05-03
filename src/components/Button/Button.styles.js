// src/components/Button/Button.styles.js
import styled, { css } from 'styled-components'

const variantStyles = {
  primary: css`
    background: var(--blue-600);
    color: #fff;
    border: none;
  `,
  outline: css`
    background: #fff;
    color: var(--black-1000);
    border: 1px solid var(--gray-200);
  `,
  danger: css`
    background: var(--red-500);
    color: #fff;
    border: none;
  `,
}

export const StyledButton = styled.button.attrs({ type: 'button' })`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 48px;
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
    color: #fff;
    border: none;
    cursor: not-allowed;
  }
`
