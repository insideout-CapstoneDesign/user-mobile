// src/components/Direction/DirectionSearch.styles.js
import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  background: var(--surface-0, #ffffff);
  padding: 0.75rem 0.5rem; 
  border-radius: var(--radius-20, 1.25rem);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08);
  width: 100%;
  gap: 0.25rem; 
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  margin: 0 0.25rem; 
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.25rem;
`;

export const Dot = styled.div`
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0; 
`;

export const PlainInput = styled.input`
  border: none;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  font-size: 1rem;
  font-weight: var(--fw-medium);
  color: var(--black-1000);
  flex: 1;
  
  &:focus { outline: none; }
  &::placeholder { color: var(--gray-400); }
`;

export const HorizontalDivider = styled.div`
  height: 1px;
  background: var(--gray-100);
  width: 100%;
  margin: 0.25rem 0;
`;

export const SwapButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem; 
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;