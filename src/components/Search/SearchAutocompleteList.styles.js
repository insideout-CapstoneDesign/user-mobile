import styled from 'styled-components'

export const AutocompleteSection = styled.section`
  width: 100%;
  padding: var(--space-12) var(--space-16) 0;
  border-top: var(--size-1) solid var(--gray-200);
`

export const SectionTitle = styled.h2`
  margin: 0 0 var(--space-12);
  color: var(--gray-500);
  font-family: var(--font-sans);
  font-size: var(--text-14);
  font-weight: 400;
  line-height: var(--line-20);
`

export const KeywordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
`

export const KeywordItem = styled.button`
  width: 100%;
  border: none;
  border-radius: var(--radius-4);
  background: var(--surface-0);
  padding: var(--space-8);
  display: inline-flex;
  align-items: center;
  gap: var(--space-12);
  color: var(--black-950);
  font-family: var(--font-sans);
  font-size: var(--text-14);
  font-weight: 400;
  line-height: var(--line-20);
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--surface-50);
  }

  &:focus-visible {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }
`

export const KeywordIcon = styled.span`
  width: var(--size-16);
  height: var(--size-16);
  color: var(--gray-400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`
