import {
  Container,
  InfoWrapper,
  TitleRow,
  Title,
  Badge,
  SubText,
  Address,
  Distance,
  ArrowIcon
} from './SearchResultItem.styles'
import RightArrow from '../../assets/icons/right-arrow.svg'

function formatDistance(distanceMeters) {
  if (typeof distanceMeters !== 'number' || Number.isNaN(distanceMeters)) return ''
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`
  return `${(distanceMeters / 1000).toFixed(1)}km`
}

export default function SearchResultItem({
  name,
  displayName,
  parentBuildingName,
  address,
  isRegistered,
  distanceMeters,
  onClick,
}) {
  const distanceText = formatDistance(distanceMeters)
  const subText = displayName ?? parentBuildingName ?? ''

  return (
    <Container type="button" onClick={onClick}>
      <InfoWrapper>
        <TitleRow>
          <Title>{name}</Title>
          {isRegistered && <Badge>등록됨</Badge>}
        </TitleRow>
        {subText ? <SubText>{subText}</SubText> : null}
        <Address>{address}</Address>
        {distanceText ? <Distance>{distanceText}</Distance> : null}
      </InfoWrapper>
      <ArrowIcon src={RightArrow} alt="" aria-hidden="true" />
    </Container>
  )
}
