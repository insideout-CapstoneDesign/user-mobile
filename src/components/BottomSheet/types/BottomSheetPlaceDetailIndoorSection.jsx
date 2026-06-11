import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FloorChip,
  FloorList,
  PoiItem,
  PoiList,
  PoiName,
  PoiSearchInput,
  PoiTitle,
  PoiToggleButton,
  SectionBlock,
  SectionTitle,
} from './BottomSheetTypes.styles'

const POI_SEARCH_THRESHOLD = 9

export default function BottomSheetPlaceDetailIndoorSection({
  building = {
    hasIndoorMap: false,
    floors: [],
  },
  pois = [],
  selectedFloor = null,
  onSelectFloor,
  showPOIs = false,
  onTogglePOIs,
  selectedPoiId = null,
  onSelectPoi,
}) {
  const [poiKeyword, setPoiKeyword] = useState('')
  const poiItemRefs = useRef({})
  const floorChipRefs = useRef({})

  const sortedFloors = useMemo(() => sortFloors(building.floors), [building.floors])
  const filteredByFloorPois =
    selectedFloor === null
      ? pois
      : pois.filter((poi) => Number(poi.floor) === Number(selectedFloor))
  const normalizedPoiKeyword = poiKeyword.trim().toLowerCase()
  const filteredPois = useMemo(() => {
    if (!normalizedPoiKeyword) return filteredByFloorPois

    return filteredByFloorPois.filter((poi) =>
      poi.name.toLowerCase().includes(normalizedPoiKeyword),
    )
  }, [filteredByFloorPois, normalizedPoiKeyword])
  const shouldShowPoiSearch = filteredByFloorPois.length >= POI_SEARCH_THRESHOLD
  const poiEmptyMessage = normalizedPoiKeyword
    ? '검색 결과가 없습니다.'
    : '선택한 층에 POI가 없습니다.'
  const selectedPoiKey = selectedPoiId == null ? null : String(selectedPoiId)

  useEffect(() => {
    if (!showPOIs || selectedPoiKey == null) return

    const target = poiItemRefs.current[selectedPoiKey]
    target?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'center',
    })
  }, [filteredPois, selectedPoiKey, showPOIs])

  useEffect(() => {
    if (selectedFloor === null) return

    const target = floorChipRefs.current[selectedFloor]
    target?.scrollIntoView?.({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedFloor, sortedFloors])

  if (!building.hasIndoorMap) return null

  return (
    <>
      {building.floors?.length ? (
        <SectionBlock>
          <SectionTitle>층 선택</SectionTitle>
          <FloorList>
            {sortedFloors.map((floor) => (
              <FloorChip
                key={floor}
                ref={(node) => {
                  floorChipRefs.current[floor] = node
                }}
                $active={selectedFloor === floor}
                type="button"
                onClick={() => onSelectFloor?.(floor)}
              >
                {floor < 0 ? `B${Math.abs(floor)}` : `${floor}`}층
              </FloorChip>
            ))}
          </FloorList>
        </SectionBlock>
      ) : null}

      {pois.length > 0 ? (
        <SectionBlock>
          <PoiToggleButton type="button" onClick={onTogglePOIs}>
            <PoiTitle>POI 목록 ({filteredByFloorPois.length}개)</PoiTitle>
            <span>{showPOIs ? '▲' : '▼'}</span>
          </PoiToggleButton>
          {showPOIs ? (
            <PoiList>
              {shouldShowPoiSearch ? (
                <PoiSearchInput
                  type="text"
                  value={poiKeyword}
                  onChange={(event) => setPoiKeyword(event.target.value)}
                  placeholder="POI 검색"
                  aria-label="POI 검색"
                />
              ) : null}
              {filteredPois.length > 0 ? (
                filteredPois.map((poi, idx) => {
                  const poiKey = poi.id == null ? null : String(poi.id)
                  const isActive = selectedPoiKey != null && poiKey === selectedPoiKey

                  return (
                    <PoiItem
                      key={poi.id ?? `${poi.name}-${idx}`}
                      ref={(node) => {
                        if (poiKey == null) return
                        poiItemRefs.current[poiKey] = node
                      }}
                      type="button"
                      $active={isActive}
                      onClick={() => onSelectPoi?.(poi)}
                      aria-pressed={isActive}
                    >
                      <PoiName>{poi.name}</PoiName>
                      <span>{poi.floor}층</span>
                    </PoiItem>
                  )
                })
              ) : (
                <PoiItem type="button" disabled>
                  <PoiName>{poiEmptyMessage}</PoiName>
                </PoiItem>
              )}
            </PoiList>
          ) : null}
        </SectionBlock>
      ) : null}
    </>
  )
}

function sortFloors(floors = []) {
  return [...floors].sort((a, b) => {
    const normalizedA = Number(a)
    const normalizedB = Number(b)

    const aIsValid = Number.isFinite(normalizedA)
    const bIsValid = Number.isFinite(normalizedB)

    if (!aIsValid && !bIsValid) return 0
    if (!aIsValid) return 1
    if (!bIsValid) return -1

    const aIsBasement = normalizedA < 0
    const bIsBasement = normalizedB < 0

    if (aIsBasement !== bIsBasement) {
      return aIsBasement ? 1 : -1
    }

    if (aIsBasement && bIsBasement) {
      return Math.abs(normalizedA) - Math.abs(normalizedB)
    }

    return normalizedA - normalizedB
  })
}
