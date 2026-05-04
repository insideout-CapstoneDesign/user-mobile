// src/components/Search/SearchResultItem.styles.js
import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0.5rem;
  background: var(--surface-0, #ffffff);
  border-bottom: 1px solid var(--gray-100, #f1f3f5);
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: var(--gray-50, #f8f9fa);
  }
`;

export const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Title = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 1rem;
  font-weight: var(--fw-semibold, 600);
  color: var(--black-1000, #1a1a1a);
`;

export const Badge = styled.span`
  background: var(--blue-50, #eef2ff);
  color: var(--blue-600, #2563eb);
  font-size: 0.6875rem; /* 11px */
  font-weight: var(--fw-bold, 700);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
`;

export const Address = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 0.875rem;
  color: var(--gray-500, #868e96);
`;

export const ArrowIcon = styled.img`
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.3;
`;