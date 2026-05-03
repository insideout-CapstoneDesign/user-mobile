import {
  TypeContainer,
  TypeDescription,
  TypeTitle,
} from './BottomSheetTypes.styles'

export default function BottomSheetCompactInfo({
  title = '정보',
  description = '간단한 안내 문구',
}) {
  return (
    <TypeContainer $compact>
      <TypeTitle>{title}</TypeTitle>
      <TypeDescription>{description}</TypeDescription>
    </TypeContainer>
  )
}
