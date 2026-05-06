import { IoSearchOutline } from 'react-icons/io5'
import {
  SearchField,
  SearchIconWrap,
  SearchInputWrapper,
} from './SearchInput.styles'

export default function SearchInput({
  value = '',
  onChange,
  placeholder = '건물, 장소 검색',
  onSearch,
  variant = 'floating',
  ariaLabel = '건물 및 장소 검색',
}) {
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return
    onSearch?.(event.currentTarget.value)
  }

  return (
    <SearchInputWrapper $variant={variant}>
      <SearchIconWrap>
        <IoSearchOutline size={20} />
      </SearchIconWrap>
      <SearchField
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </SearchInputWrapper>
  )
}
