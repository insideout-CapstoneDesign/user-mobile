import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  background: var(--surface-0);
  padding: var(--space-8);
  border-radius: var(--radius-12);
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  width: 100%;
  max-width: var(--layout-mobile-width);
  gap: var(--space-8);
  justify-content: space-between;
`;

export const TabItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: var(--size-48);
  border-radius: var(--radius-12);
  cursor: pointer;
  border: none;
  background-color: transparent;
  gap: var(--space-4);
  background: ${({ $active }) => ($active ? 'var(--blue-600)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--white)' : 'var(--gray-500)')};
  transition: all 0.2s ease-in-out;
  
  &:focus-visible {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }

  span {
    font-family: var(--font-sans);
    font-size: var(--text-12);
    font-weight: ${({ $active }) => ($active ? '700' : 'var(--fw-medium)')};
  }

  img {
    width: var(--size-24);
    height: var(--size-24);
    filter: ${({ $active }) => ($active ? 'brightness(0) invert(1)' : 'none')};
  }
`;