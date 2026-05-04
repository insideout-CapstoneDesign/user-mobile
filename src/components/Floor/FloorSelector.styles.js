// src/components/Floor/FloorSelector.styles.js
import styled from 'styled-components'

export const FloatingContainer = styled.div`
  background: var(--surface-0); 
  width: 15.75rem; 
  height: 3.25rem;  
  padding: var(--space-6) var(--space-10); 
  border-radius: var(--radius-12);
  box-shadow: var(--shadow-bottom-sheet);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-4);
  position: relative; 
`;

export const FloorInfo = styled.div`
  font-family: var(--font-sans);
  font-size: var(--text-13);
  font-weight: var(--fw-medium); 
  color: var(--gray-700);
  margin-left: var(--space-2);
`;

export const ButtonGrid = styled.div`
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;

export const SquareButton = styled.button`
  min-width: 1.875rem;
  height: var(--size-26);
  border-radius: var(--radius-4);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: var(--text-12);
  font-weight: var(--fw-medium); 
  cursor: pointer;
  transition: all 0.1s ease;

  background: ${({ $active }) => ($active ? 'var(--blue-600)' : 'var(--gray-100)')};
  color: ${({ $active }) => ($active ? 'var(--white)' : 'var(--gray-600)')};

  &:active {
    transform: scale(0.95);
  }
`;