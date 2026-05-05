import 'react'
import {
  Container,
  InfoWrapper,
  TitleRow,
  Title,
  Badge,
  Address,
  ArrowIcon
} from './SearchResultItem.styles'
import RightArrow from '../../assets/icons/right-arrow.svg'

export default function SearchResultItem({ title, address, isRegistered, onClick }) {
  return (
    <Container as="button" type="button" onClick={onClick}>
      <InfoWrapper>
        <TitleRow>
          <Title>{title}</Title>
          {isRegistered && <Badge>등록됨</Badge>}
        </TitleRow>
        <Address>{address}</Address>
      </InfoWrapper>
      <ArrowIcon src={RightArrow} alt="" aria-hidden="true" />
    </Container>
  )
}