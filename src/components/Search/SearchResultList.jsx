import SearchResultItem from './SearchResultItem'
import { SearchResultSection } from './SearchResultList.styles'

export default function SearchResultList({ items = [], onSelect }) {
  return (
    <SearchResultSection>
      {items.map((item) => (
        <SearchResultItem
          key={item.id}
          name={item.name ?? item.title}
          displayName={item.displayName}
          parentBuildingName={item.parentBuildingName}
          address={item.address}
          isRegistered={item.isRegistered}
          distanceMeters={item.distanceMeters}
          onClick={() => onSelect?.(item)}
        />
      ))}
    </SearchResultSection>
  )
}
