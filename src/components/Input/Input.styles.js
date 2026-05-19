import styled, { css } from 'styled-components'

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  margin-bottom: var(--space-12);
`

export const Label = styled.label`
  font-family: var(--font-sans);
  font-size: var(--text-14);
  font-weight: var(--fw-semibold);
  color: var(--black-1000);

  span {
    color: var(--gray-500);
    font-weight: var(--fw-medium);
    margin-left: var(--space-4);
  }
`

export const StyledInput = styled.input`
  ${() => css`
    width: 100%;
    height: var(--size-48);
    padding: 0 var(--space-16);
    border-radius: var(--radius-10);
    border: var(--size-1) solid var(--gray-200);
    font-family: var(--font-sans);
    font-size: var(--text-16);
    background: var(--surface-0);
    transition: all 0.2s ease;

    &::placeholder {
      color: var(--gray-400);
    }

    &:focus {
      outline: none;
      border-color: var(--blue-600);
    }
  `}
`

export const ErrorText = styled.p`
  margin: 0;
  min-height: var(--line-16);
  color: var(--red-500);
  font-family: var(--font-sans);
  font-size: var(--text-12);
  line-height: var(--line-16);
`
