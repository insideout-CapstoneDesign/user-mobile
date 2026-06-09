import styled, { css } from 'styled-components'

const toneStyles = {
  origin: css`
    background: var(--blue-500);
    color: var(--text-inverse);
  `,
  destination: css`
    background: transparent;
    color: var(--red-500);
  `,
  default: css`
    background: transparent;
    color: var(--black-900);
  `,
}

export const IconBubble = styled.span`
  width: ${({ $tone }) => ($tone === 'destination' ? '2.125rem' : '2rem')};
  height: ${({ $tone }) => ($tone === 'destination' ? '2.125rem' : '2rem')};
  flex: 0 0 ${({ $tone }) => ($tone === 'destination' ? '2.125rem' : '2rem')};
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $tone }) => toneStyles[$tone] ?? toneStyles.default}

  img {
    filter: ${({ $tone }) =>
      $tone === 'destination'
        ? 'invert(30%) sepia(93%) saturate(3105%) hue-rotate(337deg) brightness(103%) contrast(97%)'
        : 'brightness(0) invert(1)'};
    width: ${({ $tone }) => ($tone === 'destination' ? '1.75rem' : '1.15rem')};
    height: ${({ $tone }) => ($tone === 'destination' ? '1.75rem' : '1.15rem')};
  }
`

export const PlainStepIcon = styled.span`
  width: ${({ $tone }) => ($tone === 'origin' ? '1.875rem' : '2.125rem')};
  height: ${({ $tone }) => ($tone === 'origin' ? '1.875rem' : '2.125rem')};
  flex: 0 0 ${({ $tone }) => ($tone === 'origin' ? '1.875rem' : '2.125rem')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ $tone }) => toneStyles[$tone] ?? toneStyles.default}
  border-radius: ${({ $tone }) => ($tone === 'default' ? '0' : 'var(--radius-pill)')};

  img {
    filter: ${({ $tone }) => {
      if ($tone === 'default') return 'none'
      if ($tone === 'destination') {
        return 'invert(30%) sepia(93%) saturate(3105%) hue-rotate(337deg) brightness(103%) contrast(97%)'
      }
      return 'brightness(0) invert(1)'
    }};
    width: ${({ $tone }) => ($tone === 'origin' ? '1.1rem' : '1.75rem')};
    height: ${({ $tone }) => ($tone === 'origin' ? '1.1rem' : '1.75rem')};
  }
`

export const IconImage = styled.img`
  width: 1.75rem;
  height: 1.75rem;
  display: block;
`
