import styled from 'styled-components'

export const Container = styled.div`
  border: none;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-16) var(--space-8);
  background: var(--surface-0);
  border-bottom: var(--size-1) solid var(--gray-100);
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: var(--surface-50);
  }
  &:focus-visible {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }
`;

export const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-8);
`;

export const Title = styled.span`
  font-family: var(--font-sans);
  font-size: var(--text-16);
  font-weight: var(--fw-semibold);
  color: var(--black-1000);
`;

export const Badge = styled.span`
  background: var(--blue-50);
  color: var(--blue-600);
  font-size: var(--text-11);
  font-weight: 700;
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-4);
`;

export const Address = styled.span`
  font-family: var(--font-sans);
  font-size: var(--text-14);
  color: var(--gray-500);
`;

export const ArrowIcon = styled.img`
  width: var(--size-20);
  height: var(--size-20);
  opacity: 0.3;
`;