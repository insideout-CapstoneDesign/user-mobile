import styled from 'styled-components'

export const BottomNavContainer = styled.nav`
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100vw, var(--layout-mobile-width));
  background: var(--surface-0);
  border-top: var(--size-1) solid var(--gray-200);
  z-index: 20;
`

export const BottomNavList = styled.div`
  display: flex;
`

export const BottomNavButton = styled.button`
  flex: 1;
  border: none;
  background: transparent;
  min-height: var(--size-56);
  padding: var(--space-8) 0 calc(var(--space-8) + env(safe-area-inset-bottom));
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: ${({ $active }) => ($active ? 'var(--blue-600)' : 'var(--gray-500)')};
  font-family: var(--font-sans);
  font-size: var(--text-12);
  line-height: var(--line-16);
  cursor: pointer;
`
