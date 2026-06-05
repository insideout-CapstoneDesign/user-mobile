import BottomSheetActionBar from '../BottomSheetActionBar'
import {
  AddressText,
  StickyActionSection,
  TypeContainer,
  TypeTitle,
} from './BottomSheetTypes.styles'

export default function BottomSheetCompactInfo({
  place,
  onDeparture,
  onArrival,
}) {
  const placeName =
    place?.parentBuildingName ??
    place?.displayName ??
    place?.title ??
    place?.name ??
    '장소명'
  const placeAddress = place?.address ?? '주소 정보 없음'

  return (
    <TypeContainer $compact>
      <TypeTitle>{placeName}</TypeTitle>
      <AddressText>{placeAddress}</AddressText>

      <StickyActionSection $noBorder>
        <BottomSheetActionBar
          leftLabel="출발"
          rightLabel="도착"
          leftVariant="outline"
          rightVariant="primary"
          onLeftClick={onDeparture}
          onRightClick={onArrival}
        />
      </StickyActionSection>
    </TypeContainer>
  )
}
