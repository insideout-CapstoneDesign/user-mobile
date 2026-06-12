import { IoCloseOutline, IoSearchOutline, IoTimeOutline } from 'react-icons/io5'
import {
  AutocompleteSection,
  KeywordAction,
  KeywordIcon,
  KeywordItem,
  KeywordList,
  KeywordRow,
  KeywordRowButton,
  KeywordText,
  SectionAction,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from './SearchAutocompleteList.styles'

export default function SearchAutocompleteList({
  recentKeywords = [],
  items = [],
  onSelect,
  onRemoveRecentKeyword,
  onClearRecentKeywords,
  onSelectRecentKeyword,
}) {
  const hasRecentKeywords = recentKeywords.length > 0 && items.length === 0
  const hasAutocompleteItems = items.length > 0

  if (!hasRecentKeywords && !hasAutocompleteItems) {
    return null
  }

  return (
    <AutocompleteSection>
      {hasRecentKeywords ? (
        <SectionGroup>
          <SectionHeader>
            <SectionTitle>최근 검색어</SectionTitle>
            <SectionAction type="button" onClick={() => onClearRecentKeywords?.()}>
              전체 삭제
            </SectionAction>
          </SectionHeader>
          <KeywordList>
            {recentKeywords.map((keyword, index) => (
              <KeywordRow key={`${keyword}-${index}`}>
                <KeywordRowButton
                  type="button"
                  onClick={() => onSelectRecentKeyword?.(keyword)}
                >
                  <KeywordIcon>
                    <IoTimeOutline size={14} />
                  </KeywordIcon>
                  <KeywordText>{keyword}</KeywordText>
                </KeywordRowButton>
                <KeywordAction
                  type="button"
                  aria-label={`${keyword} 삭제`}
                  onClick={() => onRemoveRecentKeyword?.(keyword)}
                >
                  <IoCloseOutline size={16} />
                </KeywordAction>
              </KeywordRow>
            ))}
          </KeywordList>
        </SectionGroup>
      ) : null}

      {hasAutocompleteItems ? (
        <SectionGroup>
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
        </SectionGroup>
      ) : null}
    </AutocompleteSection>
  )
}
