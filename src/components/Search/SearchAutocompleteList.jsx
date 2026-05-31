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
        {items.map((item, index) => (
          <KeywordItem
            key={item.id ?? `${item.title}-${index}`}
            type="button"
            onClick={() => onSelect?.(item)}
          >
            <KeywordIcon>
              <IoSearchOutline size={14} />
            </KeywordIcon>
            <span>{item.title}</span>
          </KeywordItem>
        ))}
      </KeywordList>
    </AutocompleteSection>
  )
}
