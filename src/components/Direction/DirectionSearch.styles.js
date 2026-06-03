import styled, { css } from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  background: var(--surface-0);
  padding: var(--space-12) var(--space-8);
  border-radius: var(--radius-12);
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  width: 100%;
  gap: var(--space-4);
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  margin: 0 var(--space-4); 
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-8);
  height: var(--size-36);
`;

export const Dot = styled.div`
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: var(--radius-pill);
  flex-shrink: 0; 

  ${({ $color }) => css`
    background: ${$color};
  `}
`;

export const PlainInput = styled.input`
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-16);
  font-weight: var(--fw-medium);
  color: var(--black-1000);
  flex: 1;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  
  &:focus { outline: none; }
  
  &:focus-visible {
    outline: 2px solid var(--blue-500);
    outline-offset: 2px;
    border-radius: var(--radius-6);
  }

  &::placeholder { 
    color: var(--gray-400); 
  }
`;

export const HorizontalDivider = styled.div`
  height: var(--size-1);
  background: var(--gray-100);
  width: 100%;
  margin: var(--space-4) 0;
`;

export const SwapButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-4); 
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
