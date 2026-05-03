import styled from 'styled-components'

export const TypeContainer = styled.div`
  display: grid;
  gap: ${({ $compact }) => ($compact ? '6px' : '12px')};
  min-width: 0;
  overflow-x: hidden;
`

export const TypeTitle = styled.h3`
  margin: 0;
  color: var(--black-900);
  font-size: 1rem;
`

export const TypeDescription = styled.p`
  margin: 0;
  color: var(--gray-600);
  font-size: 0.875rem;
`

export const PlaceHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const PlaceHeadLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const PlaceBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--blue-600);
  background: var(--blue-100);
  border-radius: 6px;
  padding: 4px 8px;
`

export const FavoriteButton = styled.button`
  border: none;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? 'var(--yellow-500)' : 'var(--gray-400)')};
`

export const FloorChip = styled.button`
  width: fit-content;
  flex: 0 0 auto;
  white-space: nowrap;
  border: 1px solid var(--gray-200);
  background: var(--blue-50);
  color: var(--blue-600);
  border-radius: 999px;
  padding: 4px 10px;
  font-family: var(--font-sans);
`

export const AddressText = styled.p`
  margin: 0;
  color: var(--gray-600);
  font-size: 0.875rem;
`

export const SectionBlock = styled.div`
  border-top: 1px solid var(--gray-200);
  padding-top: 16px;
  min-width: 0;
`

export const SectionTitle = styled.p`
  margin: 0 0 12px;
  color: var(--black-900);
  font-size: 0.875rem;
  font-weight: 600;
`

export const FloorList = styled.div`
  display: flex;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding-bottom: 2px;
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
  padding: 4px 0;
  cursor: pointer;
`

export const PoiTitle = styled.span`
  color: var(--black-900);
  font-size: 0.875rem;
  font-weight: 600;
`

export const PoiList = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 8px;
  max-height: 192px;
  overflow-y: auto;
`

export const PoiItem = styled.button`
  border: none;
  background: var(--surface-50);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
`

export const PoiName = styled.span`
  color: var(--black-900);
  font-size: 0.875rem;
`

export const PoiFloor = styled.span`
  color: var(--gray-500);
  font-size: 0.75rem;
`

export const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

export const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--gray-600);
  font-size: 0.8125rem;
`

export const ReviewWriteButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--gray-200);
  background: var(--surface-0);
  color: var(--black-900);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  margin-bottom: 10px;
`

export const ReviewCardList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
`

export const ReviewCard = styled.div`
  background: var(--surface-50);
  border-radius: 10px;
  padding: 10px 12px;
`

export const ReviewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  color: var(--gray-500);
  font-size: 0.75rem;
`

export const ReviewText = styled.p`
  margin: 0;
  color: var(--black-900);
  font-size: 0.875rem;
`

export const ReviewMoreButton = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  color: var(--blue-600);
  font-size: 0.875rem;
  padding: 8px 0 2px;
`

export const ActionTitle = styled.p`
  margin: 0 0 8px;
  color: var(--gray-500);
  font-size: 0.75rem;
`

export const StickyActionSection = styled.div`
  position: sticky;
  bottom: -20px;
  margin: 0 -16px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--gray-200);
  background: var(--surface-0);
`

export const RouteList = styled.div`
  display: grid;
  gap: 8px;
`

export const RouteCard = styled.button`
  border: 1px solid var(--gray-200);
  background: var(--surface-0);
  border-radius: 12px;
  padding: 12px;
  text-align: left;
`

export const RouteCardTitle = styled.strong`
  color: var(--black-900);
  font-size: 0.9375rem;
`

export const RouteCardDescription = styled.p`
  margin: 6px 0 0;
  color: var(--gray-600);
  font-size: 0.875rem;
`
