import { IoSearchOutline } from 'react-icons/io5'
import {
  AutocompleteSection,
  KeywordIcon,
  KeywordItem,
  KeywordList,
  SectionTitle,
} from './SearchAutocompleteList.styles'

export default function SearchAutocompleteList({ items = [], onSelect }) {
  return (
    <AutocompleteSection>
      <SectionTitle>자동완성</SectionTitle>
      <KeywordList>
        {items.map((item) => (
          <KeywordItem key={item} type="button" onClick={() => onSelect?.(item)}>
            <KeywordIcon>
              <IoSearchOutline size={14} />
            </KeywordIcon>
            <span>{item}</span>
          </KeywordItem>
        ))}
      </KeywordList>
    </AutocompleteSection>
  )
}
