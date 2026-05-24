import SearchResultItem from './SearchResultItem'
import { SearchResultSection } from './SearchResultList.styles'

export default function SearchResultList({ items = [], onSelect }) {
  return (
    <SearchResultSection>
      {items.map((item) => (
        <SearchResultItem
          key={item.id}
          title={item.title}
          address={item.address}
          isRegistered={item.isRegistered}
          onClick={() => onSelect?.(item)}
        />
      ))}
    </SearchResultSection>
  )
}
