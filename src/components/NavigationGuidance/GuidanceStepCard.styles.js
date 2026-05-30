import styled from 'styled-components'

export const CardRoot = styled.div`
  width: 100%;
  display: grid;
  gap: var(--space-10);
`

export const CardButton = styled.button`
  width: 100%;
  min-height: 5rem;
  border: none;
  border-radius: var(--radius-8);
  background: var(--surface-0);
  box-shadow: var(--shadow-searchbar);
  padding: var(--space-16) var(--space-20);
  display: flex;
  align-items: center;
  gap: var(--space-14);
  color: var(--black-900);
  font-family: var(--font-sans);
  text-align: left;
  cursor: pointer;
  touch-action: pan-y;
`

export const CardContent = styled.span`
  min-width: 0;
  display: grid;
  gap: var(--space-4);
`

export const CardTitle = styled.span`
  color: var(--black-900);
  font-size: var(--text-16);
  font-weight: var(--fw-semibold);
  line-height: var(--line-24);
  overflow-wrap: anywhere;
`

export const CardMeta = styled.span`
  color: var(--gray-500);
  font-size: var(--text-12);
  line-height: var(--line-16);
`

export const ProgressRow = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--space-4);
`

export const ProgressDot = styled.span`
  width: ${({ $active }) => ($active ? '1.125rem' : 'var(--space-6)')};
  height: var(--space-6);
  border-radius: var(--radius-pill);
  background: ${({ $active }) => ($active ? 'var(--blue-600)' : 'rgba(54, 65, 83, 0.22)')};
  transition: width 0.16s ease, background 0.16s ease;
`
