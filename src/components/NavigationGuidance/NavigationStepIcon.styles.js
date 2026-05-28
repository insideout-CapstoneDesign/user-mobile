import styled, { css } from 'styled-components'

const toneStyles = {
  origin: css`
    background: var(--blue-500);
    color: var(--text-inverse);
  `,
  destination: css`
    background: var(--red-500);
    color: var(--text-inverse);
  `,
  default: css`
    background: transparent;
    color: var(--black-900);
  `,
}

export const IconBubble = styled.span`
  width: var(--size-36);
  height: var(--size-36);
  flex: 0 0 var(--size-36);
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $tone }) => toneStyles[$tone] ?? toneStyles.default}

  img {
    filter: brightness(0) invert(1);
  }
`

export const PlainStepIcon = styled.span`
  width: var(--size-26);
  height: var(--size-26);
  flex: 0 0 var(--size-26);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $tone }) => toneStyles[$tone] ?? toneStyles.default}
  border-radius: ${({ $tone }) => ($tone === 'default' ? '0' : 'var(--radius-pill)')};
`

export const IconImage = styled.img`
  width: 1.25rem;
  height: 1.25rem;
  display: block;
`
