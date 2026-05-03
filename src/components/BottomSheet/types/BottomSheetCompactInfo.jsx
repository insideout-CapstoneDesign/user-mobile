import BottomSheetActionBar from '../BottomSheetActionBar'
import {
  AddressText,
  StickyActionSection,
  TypeContainer,
  TypeTitle,
} from './BottomSheetTypes.styles'

export default function BottomSheetCompactInfo({
  place = {
    name: '학생회관',
    address: '서울시 관악구 관악로 3',
  },
  onDeparture,
  onArrival,
}) {
  return (
    <TypeContainer $compact>
      <TypeTitle>{place.name}</TypeTitle>
      <AddressText>{place.address}</AddressText>

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
