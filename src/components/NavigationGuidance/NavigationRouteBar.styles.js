import styled from 'styled-components'

export const RouteBarRoot = styled.div`
  display: flex;
  gap: var(--space-3);
`

export const RouteBarSegment = styled.div`
  flex: ${({ $weight }) => Math.max($weight ?? 1, 1)};
  min-width: 1.625rem;
  min-height: 0.875rem;
  border-radius: var(--radius-4);
  background: ${({ $bg }) => $bg || 'var(--gray-500)'};
  color: var(--text-inverse);
  padding: var(--space-2) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  font-size: 0.5625rem;
  font-weight: 700;
  line-height: var(--line-16);
  white-space: nowrap;
`

export const RouteBarWalkText = styled.span`
  color: var(--gray-700);
  font-size: 0.5625rem;
  font-weight: 700;
`

export const RouteLineBadge = styled.span`
  border: var(--size-1) solid var(--text-inverse);
  border-radius: var(--space-3);
  padding: 0 var(--space-2);
  line-height: 0.6875rem;
  font-size: 0.5625rem;
`
