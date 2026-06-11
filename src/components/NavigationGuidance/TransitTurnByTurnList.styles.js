import styled, { css } from 'styled-components'

const transitColor = ({ $type, $color }) => {
  if ($color) return $color
  if ($type === 'bus') return 'var(--green-500)'
  if ($type === 'subway') return 'var(--blue-900)'
  if ($type === 'indoor' || $type === 'campus') return 'var(--red-500)'
  if ($type === 'point') return 'var(--red-500)'
  return 'var(--gray-400)'
}

const pointColor = ({ $tone }) => {
  if ($tone === 'origin') return 'var(--blue-500)'
  if ($tone === 'destination') return 'var(--red-500)'
  return 'var(--gray-400)'
}

export const RouteBarSection = styled.div`
  padding: 0 var(--space-8) var(--space-20);
`

export const TransitDetailList = styled.div`
  display: grid;
`

export const IndoorStepList = styled.div`
  display: grid;
`

export const IndoorDividerLabel = styled.div`
  min-height: 2.5rem;
  border-top: var(--size-1) solid var(--gray-200);
  border-bottom: var(--size-1) solid var(--gray-200);
  background: var(--gray-100);
  display: flex;
  align-items: center;
  padding: 0 var(--space-12);
  color: var(--gray-700);
  font-size: var(--text-14);
  font-weight: var(--fw-medium);
  line-height: var(--line-20);
`

export const IndoorDividerButton = styled.button`
  min-height: 2.5rem;
  border: none;
  border-top: var(--size-1) solid var(--gray-200);
  border-bottom: var(--size-1) solid var(--gray-200);
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-12);
  color: var(--gray-700);
  font-family: var(--font-sans);
  font-size: var(--text-14);
  font-weight: var(--fw-medium);
  line-height: var(--line-20);
  cursor: pointer;

  svg {
    color: var(--gray-600);
    transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.16s ease;
  }
`

export const LegCard = styled.div`
  position: relative;
  z-index: ${({ $type }) => ($type === 'bus' || $type === 'subway' ? 2 : 1)};
  display: grid;
  grid-template-columns: var(--size-48) 1fr;
  min-height: 5.5rem;
  cursor: ${({ $selectable }) => ($selectable ? 'pointer' : 'default')};

  &:focus-visible {
    outline: ${({ $selectable }) =>
      $selectable ? '2px solid var(--blue-500)' : 'none'};
    outline-offset: -2px;
  }
`

export const LegTimeline = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: var(--space-16);
  overflow: visible;
`

export const LegIcon = styled.span`
  position: relative;
  z-index: 1;
  width: var(--size-36);
  height: var(--size-36);
  border-radius: var(--radius-pill);
  border: ${({ $type, $color }) =>
    $type === 'bus' || $type === 'subway'
      ? `var(--size-1) solid ${transitColor({ $type, $color })}`
      : 'none'};
  background: var(--surface-0);
  color: ${transitColor};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${({ $type }) =>
      $type === 'point' || $type === 'building'
      ? css`
          width: var(--size-26);
          height: var(--size-26);
          margin-top: var(--space-4);
          background: ${pointColor};
        `
      : null}

  ${({ $type }) =>
      $type === 'bus' || $type === 'subway' || $type === 'indoor' || $type === 'campus'
      ? css`
          width: var(--size-26);
          height: var(--size-26);
          flex: 0 0 var(--size-26);
        `
      : null}

  ${({ $type }) =>
    $type === 'walk'
      ? css`
          width: var(--size-24);
          height: var(--size-24);
          margin-top: var(--space-6);
          background: transparent;
        `
      : null}

  img {
    width: ${({ $type }) => ($type === 'point' || $type === 'building' ? '1rem' : '1.25rem')};
    height: ${({ $type }) => ($type === 'point' || $type === 'building' ? '1rem' : '1.25rem')};
    display: block;
    filter: ${({ $type }) =>
      $type === 'point' || $type === 'building'
        ? 'brightness(0) invert(1)'
        : 'invert(39%) sepia(13%) saturate(716%) hue-rotate(182deg) brightness(88%) contrast(86%)'};
  }
`

export const LegConnector = styled.span`
  position: absolute;
  top: ${({ $isFirst }) => ($isFirst ? '2rem' : '0')};
  bottom: calc(-1 * var(--space-16));
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  width: ${({ $type }) => ($type === 'bus' || $type === 'subway' ? '0.375rem' : '0')};
  border-left: ${({ $type }) =>
    $type === 'bus' || $type === 'subway' || $type === 'indoor' || $type === 'campus'
      ? 'none'
      : '0.25rem dotted var(--gray-200)'};
  border-radius: var(--radius-pill);
  background: ${({ $type, $color }) =>
    $type === 'bus' || $type === 'subway' || $type === 'indoor' || $type === 'campus'
      ? transitColor({ $type, $color })
      : 'transparent'};
`

export const LegBody = styled.div`
  min-width: 0;
  padding: var(--space-16) 0 var(--space-16) var(--space-8);
  border-bottom: var(--size-1) solid var(--gray-100);
`

export const LegTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--space-8);
  min-width: 0;
`

export const LegName = styled.strong`
  color: var(--black-900);
  font-size: var(--text-16);
  font-weight: 700;
  line-height: var(--line-20);
  overflow-wrap: anywhere;
`

export const LegMeta = styled.span`
  color: var(--gray-500);
  font-size: var(--text-13);
  line-height: var(--line-16);
`

export const LegSubText = styled.p`
  margin: var(--space-6) 0 0;
  color: var(--gray-500);
  font-size: var(--text-14);
  line-height: var(--line-20);
`

export const ToggleButton = styled.button`
  width: fit-content;
  max-width: 100%;
  margin-top: var(--space-14);
  border: none;
  background: transparent;
  color: var(--black-900);
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  padding: 0;
  font-family: var(--font-sans);
  font-size: var(--text-14);
  font-weight: 700;
  line-height: var(--line-20);
  cursor: pointer;

  svg {
    color: var(--black-900);
    transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.16s ease;
  }
`

export const HiddenStopList = styled.div`
  display: grid;
  gap: var(--space-8);
  margin-top: var(--space-12);
  padding: var(--space-10) var(--space-12);
  border-radius: var(--radius-8);
  background: var(--surface-50);
`

export const HiddenStop = styled.span`
  color: var(--gray-600);
  font-size: var(--text-14);
  line-height: var(--line-20);
`

export const LegStation = styled.strong`
  display: block;
  margin-top: var(--space-20);
  color: var(--black-900);
  font-size: var(--text-16);
  font-weight: 700;
  line-height: var(--line-20);
  overflow-wrap: anywhere;
`

export const WalkTitle = styled.strong`
  display: block;
  color: var(--black-900);
  font-size: var(--text-14);
  font-weight: 700;
  line-height: var(--line-20);
  overflow-wrap: anywhere;
`

export const WalkDetailText = styled.p`
  margin: var(--space-4) 0 0;
  color: var(--gray-500);
  font-size: var(--text-12);
  line-height: var(--line-16);
`
