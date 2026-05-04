// src/components/Direction/DirectionSearch.jsx
import 'react'
import * as S from './DirectionSearch.styles'
import SwapIcon from '../../assets/icons/swap-icon.svg';
import BackIcon from '../../assets/icons/back-icon.svg';

export default function DirectionSearch({ origin, destination, onSwap, onBack }) {
  return (
    <S.Container>
      <S.BackButton type="button" onClick={onBack}>
        <img src={BackIcon} alt="뒤로가기" width="24" height="24" />
      </S.BackButton>

      <S.ContentWrapper>
        <S.InputRow>
          <S.Dot $color="#3B82F6" />
          <S.PlainInput placeholder="출발지" value={origin} readOnly />
        </S.InputRow>

        <S.HorizontalDivider />

        <S.InputRow>
          <S.Dot $color="#EF4444" />
          <S.PlainInput placeholder="도착지" value={destination} readOnly />
        </S.InputRow>
      </S.ContentWrapper>

      <S.SwapButton type="button" onClick={onSwap}>
        <img src={SwapIcon} alt="위치 바꾸기" width="20" height="20" />
      </S.SwapButton>
    </S.Container>
  )
}