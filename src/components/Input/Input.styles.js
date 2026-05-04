// src/components/Input/Input.styles.js
import styled from 'styled-components'

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  font-family: 'Pretendard', sans-serif;
  font-size: 0.875rem;
  font-weight: var(--fw-semibold);
  color: var(--black-1000);
  
  span {
    color: var(--gray-500);
    font-weight: var(--fw-regular);
    margin-left: 0.25rem;
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  height: 3.25rem;
  padding: 0 1rem;
  border-radius: var(--radius-10);
  border: var(--size-1, 1px) solid var(--gray-200);
  font-family: 'Pretendard', sans-serif;
  font-size: 1rem;
  background: var(--surface-0);
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--gray-400);
  }

  &:focus {
    outline: none;
    border-color: var(--blue-600);
  }
`;