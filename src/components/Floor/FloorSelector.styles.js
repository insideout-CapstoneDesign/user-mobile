// src/components/Floor/FloorSelector.styles.js
import styled from 'styled-components'

export const FloatingContainer = styled.div`
  background: var(--surface-0, #ffffff);
  width: 15.75rem; /* 252px */
  height: 3.25rem;  /* 52px */
  padding: 0.4rem 0.6rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  position: relative; 
`;

export const FloorInfo = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-700, #4b5563);
  margin-left: 0.125rem;
`;

export const ButtonGrid = styled.div`
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;

export const SquareButton = styled.button`
  min-width: 1.875rem; /* 30px */
  height: 1.5rem;    /* 24px */
  border-radius: 0.25rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pretendard', sans-serif;
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease;

  background: ${({ $active }) => ($active ? 'var(--blue-600, #2563eb)' : 'var(--gray-100, #f3f4f6)')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--gray-600, #6b7280)')};

  &:active {
    transform: scale(0.95);
  }
`;