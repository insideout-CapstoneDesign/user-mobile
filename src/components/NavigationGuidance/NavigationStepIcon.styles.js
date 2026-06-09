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
  width: 2rem;
  height: 2rem;
  flex: 0 0 2rem;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $tone }) => toneStyles[$tone] ?? toneStyles.default}

  img {
    filter: brightness(0) invert(1);
    width: 1.15rem;
    height: 1.15rem;
  }
`

export const PlainStepIcon = styled.span`
  width: ${({ $tone }) => ($tone === 'default' ? '2.125rem' : '1.875rem')};
  height: ${({ $tone }) => ($tone === 'default' ? '2.125rem' : '1.875rem')};
  flex: 0 0 ${({ $tone }) => ($tone === 'default' ? '2.125rem' : '1.875rem')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $tone }) => toneStyles[$tone] ?? toneStyles.default}
  border-radius: ${({ $tone }) => ($tone === 'default' ? '0' : 'var(--radius-pill)')};

  img {
    filter: ${({ $tone }) => ($tone === 'default' ? 'none' : 'brightness(0) invert(1)')};
    width: ${({ $tone }) => ($tone === 'default' ? '1.75rem' : '1.1rem')};
    height: ${({ $tone }) => ($tone === 'default' ? '1.75rem' : '1.1rem')};
  }
`

export const IconImage = styled.img`
  width: 1.75rem;
  height: 1.75rem;
  display: block;
`
