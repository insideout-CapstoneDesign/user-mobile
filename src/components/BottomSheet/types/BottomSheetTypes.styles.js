import styled from 'styled-components'

export const TypeContainer = styled.div`
  display: grid;
  gap: ${({ $compact }) => ($compact ? 'var(--space-6)' : 'var(--space-12)')};
  min-width: 0;
  overflow-x: hidden;
`

export const TypeTitle = styled.h3`
  margin: 0;
  color: var(--black-900);
  font-size: var(--text-16);
`

export const PlaceHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-12);
`

export const PlaceHeadLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-8);
`

export const PlaceBadge = styled.span`
  font-size: var(--text-12);
  font-weight: 600;
  color: var(--blue-600);
  background: var(--blue-100);
  border-radius: var(--radius-6);
  padding: var(--space-4) var(--space-8);
`

export const FavoriteButton = styled.button`
  border: none;
  background: transparent;
  padding: var(--space-4);
  cursor: pointer;
  color: ${({ $active }) => ($active ? 'var(--yellow-500)' : 'var(--gray-400)')};
`

export const FloorChip = styled.button`
  width: fit-content;
  flex: 0 0 auto;
  white-space: nowrap;
  border: var(--size-1) solid var(--gray-200);
  background: var(--blue-50);
  color: var(--blue-600);
  border-radius: var(--radius-pill);
  padding: var(--space-4) var(--space-10);
  font-family: var(--font-sans);
`

export const AddressText = styled.p`
  margin: 0;
  color: var(--gray-600);
  font-size: var(--text-14);
`

export const SectionBlock = styled.div`
  border-top: var(--size-1) solid var(--gray-200);
  padding-top: var(--space-16);
  min-width: 0;
`

export const SectionTitle = styled.p`
  margin: 0 0 var(--space-12);
  color: var(--black-900);
  font-size: var(--text-14);
  font-weight: 600;
`

export const FloorList = styled.div`
  display: flex;
  gap: var(--space-8);
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding-bottom: var(--space-2);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
`

export const PoiToggleButton = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  cursor: pointer;
`

export const PoiTitle = styled.span`
  color: var(--black-900);
  font-size: var(--text-14);
  font-weight: 600;
`

export const PoiList = styled.div`
  margin-top: var(--space-10);
  display: grid;
  gap: var(--space-8);
  max-height: var(--size-192);
  overflow-y: auto;
`

export const PoiItem = styled.button`
  border: none;
  background: var(--surface-50);
  border-radius: var(--radius-10);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  padding: var(--space-10) var(--space-12);
  text-align: left;
  cursor: pointer;
`

export const PoiName = styled.span`
  color: var(--black-900);
  font-size: var(--text-14);
`

export const PoiFloor = styled.span`
  color: var(--gray-500);
  font-size: var(--text-12);
`

export const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-12);
`

export const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--gray-600);
  font-size: var(--text-13);
`

export const ReviewWriteButton = styled.button`
  width: 100%;
  padding: var(--space-10) var(--space-12);
  border-radius: var(--radius-10);
  border: var(--size-1) solid var(--gray-200);
  background: var(--surface-0);
  color: var(--black-900);
  font-family: var(--font-sans);
  font-size: var(--text-14);
  margin-bottom: var(--space-10);
`

export const ReviewCardList = styled.div`
  display: grid;
  gap: var(--space-8);
  max-height: var(--size-220);
  overflow-y: auto;
  padding-right: var(--space-2);
`

export const ReviewCard = styled.div`
  background: var(--surface-50);
  border-radius: var(--radius-10);
  padding: var(--space-10) var(--space-12);
`

export const ReviewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  color: var(--gray-500);
  font-size: var(--text-12);
`

export const ReviewText = styled.p`
  margin: 0;
  color: var(--black-900);
  font-size: var(--text-14);
`

export const ReviewMoreButton = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  color: var(--blue-600);
  font-size: var(--text-14);
  padding: var(--space-8) 0 var(--space-2);
`

export const ActionTitle = styled.p`
  margin: 0 0 var(--space-8);
  color: var(--gray-500);
  font-size: var(--text-12);
`

export const StickyActionSection = styled.div`
  position: sticky;
  bottom: calc(-1 * var(--space-20));
  margin: 0 calc(-1 * var(--space-16));
  padding: var(--space-12) var(--space-16)
    calc(var(--space-12) + env(safe-area-inset-bottom));
  border-top: ${({ $noBorder }) =>
    $noBorder ? 'none' : 'var(--size-1) solid var(--gray-100)'};
  background: var(--surface-0);
`

export const RouteSectionTitle = styled.p`
  margin: 0;
  color: var(--gray-500);
  font-size: var(--text-14);
  font-weight: 500;
`


export const RouteList = styled.div`
  display: grid;
  gap: var(--space-10);
`

export const RouteCard = styled.button`
  border: var(--size-1) solid
    ${({ $active }) => ($active ? 'var(--blue-600)' : 'var(--gray-200)')};
  background: ${({ $active }) => ($active ? 'var(--blue-50)' : 'var(--surface-0)')};
  border-radius: var(--radius-12);
  padding: var(--space-12);
  text-align: left;
  cursor: pointer;
`

export const RouteCardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const RouteTimeText = styled.strong`
  color: var(--black-900);
  font-size: var(--text-16);
`

export const RouteBar = styled.div`
  margin-top: var(--space-10);
  display: flex;
  gap: var(--space-3);
`

export const RouteBarSegment = styled.div`
  flex: ${({ $weight }) => Math.max($weight, 1)};
  min-width: var(--size-36);
  border-radius: var(--radius-5);
  background: ${({ $bg }) => $bg || 'var(--gray-500)'};
  color: var(--text-inverse);
  min-height: var(--size-26);
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  font-size: var(--text-11);
  font-weight: 600;
`

export const RouteBarWalkText = styled.span`
  color: var(--gray-700);
  font-size: var(--text-11);
  font-weight: 600;
`

export const RouteLineBadge = styled.span`
  border: var(--size-1) solid var(--text-inverse);
  border-radius: var(--radius-4);
  padding: 0 var(--space-4);
  line-height: 1.2;
`

export const RouteSteps = styled.div`
  margin-top: var(--space-10);
  display: grid;
  gap: var(--space-8);
`

export const RouteStepItem = styled.div`
  display: grid;
  grid-template-columns: var(--size-18) 1fr;
  gap: var(--space-8);
  align-items: start;
`

export const RouteStepIconColumn = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: var(--space-2);
  color: ${({ $color }) => $color || 'var(--gray-400)'};
`

export const RouteStepConnector = styled.span`
  position: absolute;
  top: var(--size-18);
  left: 50%;
  width: var(--size-1);
  height: var(--space-14);
  transform: translateX(-50%);
  background: var(--gray-200);
`

export const RoutePointDot = styled.span`
  width: var(--size-8);
  height: var(--size-8);
  border-radius: var(--radius-pill);
  background: var(--gray-400);
  margin-top: var(--space-5);
`

export const RouteStepContent = styled.div`
  display: grid;
  gap: var(--space-2);
`

export const RouteStepTitle = styled.span`
  color: var(--black-900);
  font-size: var(--text-13);
  font-weight: 600;
`

export const RouteStepSub = styled.span`
  color: var(--gray-500);
  font-size: var(--text-12);
`

export const RouteEmptyText = styled.p`
  margin: 0;
  color: var(--gray-600);
  font-size: var(--text-14);
  text-align: center;
  padding: var(--space-12) 0;
`

export const RouteOptionName = styled.strong`
  color: var(--black-900);
  font-size: var(--text-16);
  font-weight: var(--fw-medium);
  line-height: var(--line-24);
  letter-spacing: -0.02em;
`

export const RouteOptionMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-top: var(--space-4);
`

export const RouteOptionTime = styled.span`
  color: var(--blue-600);
  font-size: var(--text-20);
  font-weight: 600;
  line-height: var(--line-20);
  letter-spacing: -0.01em;
`

export const RouteOptionDistance = styled.span`
  color: var(--gray-600);
  font-size: var(--text-14);
  font-weight: 400;
  line-height: var(--line-20);
  letter-spacing: -0.01em;
`

export const RouteOptionExtra = styled.p`
  margin: var(--space-4) 0 0;
  color: var(--gray-500);
  font-size: var(--text-12);
  line-height: var(--line-16);
`
