import styled from 'styled-components'

export const IndoorSuffix = styled.span`
  display: inline-block;
  margin-left: ${({ $position }) => ($position === 'prefix' ? '0' : 'var(--space-4)')};
  margin-right: ${({ $position }) => ($position === 'prefix' ? 'var(--space-4)' : '0')};
  font-size: 0.72em;
  font-weight: var(--fw-semibold);
  line-height: 1;
  vertical-align: baseline;
  white-space: nowrap;
`
