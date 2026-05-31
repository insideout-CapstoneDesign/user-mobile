import {
  Container,
  InfoWrapper,
  TitleRow,
  Title,
  Badge,
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
  title,
  address,
  isRegistered,
  distanceMeters,
  onClick,
}) {
  const distanceText = formatDistance(distanceMeters)

  return (
    <Container type="button" onClick={onClick}>
      <InfoWrapper>
        <TitleRow>
          <Title>{title}</Title>
          {isRegistered && <Badge>등록됨</Badge>}
        </TitleRow>
        <Address>{address}</Address>
        {distanceText ? <Distance>{distanceText}</Distance> : null}
      </InfoWrapper>
      <ArrowIcon src={RightArrow} alt="" aria-hidden="true" />
    </Container>
  )
}
