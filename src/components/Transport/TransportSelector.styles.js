import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  background: var(--surface-0, #ffffff);
  padding: 0.5rem;
  border-radius: var(--radius-20, 1.25rem);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 21.4375rem; /* 343px */
  gap: 0.5rem;
  justify-content: space-between;
`;

export const TabItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 4.5rem;
  border-radius: var(--radius-12, 0.75rem);
  cursor: pointer;
  gap: 0.25rem;
  background: ${({ $active }) => ($active ? 'var(--blue-600, #2563eb)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--gray-500, #999)')};
  transition: all 0.2s ease-in-out;

  span {
    font-size: 0.75rem;
    font-weight: ${({ $active }) => ($active ? 'var(--fw-bold, 700)' : 'var(--fw-medium, 500)')};
  }

  img {
    width: 1.5rem;
    height: 1.5rem;
    filter: ${({ $active }) => ($active ? 'brightness(0) invert(1)' : 'none')};
  }
`;