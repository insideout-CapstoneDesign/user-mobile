import styled from 'styled-components'

export const ListRoot = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 30;
  width: min(100%, var(--layout-mobile-width));
  display: flex;
  flex-direction: column;
  background: var(--surface-0);
  box-shadow: var(--shadow-searchbar);
  font-family: var(--font-sans);
`

export const ListBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--space-20) var(--space-16)
    calc(var(--space-20) + env(safe-area-inset-bottom));
`

export const RouteMetric = styled.div`
  display: grid;
  gap: var(--space-6);
  padding: 0 var(--space-12) var(--space-20);
`

export const RouteMetricLabel = styled.span`
  color: var(--gray-600);
  font-size: var(--text-13);
  font-weight: var(--fw-medium);
`

export const RouteMetricRow = styled.div`
  display: flex;
  align-items: end;
  gap: var(--space-10);
`

export const RouteMetricTime = styled.strong`
  color: var(--black-1000);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
`

export const DestinationText = styled.span`
  color: var(--gray-700);
  font-size: var(--text-13);
  line-height: var(--line-20);
  padding-bottom: var(--space-3);
`

export const RouteMetricSub = styled.span`
  color: var(--gray-500);
  font-size: var(--text-12);
  line-height: var(--line-16);
`

export const Divider = styled.div`
  height: var(--size-1);
  background: var(--gray-100);
`

export const ListItem = styled.button`
  width: 100%;
  min-height: 3.75rem;
  border: none;
  border-bottom: var(--size-1) solid var(--gray-100);
  background: ${({ $active }) => ($active ? 'var(--blue-50)' : 'var(--surface-0)')};
  display: flex;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-10) var(--space-12);
  color: var(--black-900);
  font-family: var(--font-sans);
  text-align: left;
  cursor: pointer;
`

export const ListItemContent = styled.span`
  min-width: 0;
  display: grid;
  gap: var(--space-4);
`

export const ListItemTitle = styled.span`
  color: var(--black-900);
  font-size: var(--text-14);
  font-weight: var(--fw-semibold);
  line-height: var(--line-20);
  overflow-wrap: anywhere;
`
