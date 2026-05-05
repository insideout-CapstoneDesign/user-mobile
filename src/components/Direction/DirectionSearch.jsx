import 'react'
import {
  Container,
  BackButton,
  ContentWrapper,
  InputRow,
  Dot,
  PlainInput,
  HorizontalDivider,
  SwapButton
} from './DirectionSearch.styles'
import SwapIcon from '../../assets/icons/swap-icon.svg';
import BackIcon from '../../assets/icons/back-icon.svg';

export default function DirectionSearch({ origin, destination, onSwap, onBack }) {
  return (
    <Container>
      <BackButton type="button" onClick={onBack}>
        <img src={BackIcon} alt="뒤로가기" width="24" height="24" />
      </BackButton>

      <ContentWrapper>
        <InputRow>
          <Dot $color="var(--blue-500)" />
          <PlainInput placeholder="출발지" value={origin} readOnly />
        </InputRow>

        <HorizontalDivider />

        <InputRow>
          <Dot $color="var(--red-500)" />
          <PlainInput placeholder="도착지" value={destination} readOnly />
        </InputRow>
      </ContentWrapper>

      <SwapButton type="button" onClick={onSwap}>
        <img src={SwapIcon} alt="위치 바꾸기" width="20" height="20" />
      </SwapButton>
    </Container>
  )
}