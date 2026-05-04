// src/components/Search/SearchResultItem.jsx
import 'react'
import * as S from './SearchResultItem.styles'
import RightArrow from '../../assets/icons/right-arrow.svg'

export default function SearchResultItem({ title, address, isRegistered, onClick }) {
  return (
    <S.Container as="button" type="button" onClick={onClick}>
      <S.InfoWrapper>
        <S.TitleRow>
          <S.Title>{title}</S.Title>
          {isRegistered && <S.Badge>등록됨</S.Badge>}
        </S.TitleRow>
        <S.Address>{address}</S.Address>
      </S.InfoWrapper>
      
      <S.ArrowIcon src={RightArrow} alt="상세보기" />
    </S.Container>
  )
}