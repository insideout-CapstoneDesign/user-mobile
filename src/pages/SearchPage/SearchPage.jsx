import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import SearchAutocompleteList from '../../components/Search/SearchAutocompleteList'
import SearchResultList from '../../components/Search/SearchResultList'
import {
  mockAutocompleteKeywords,
  mockSearchPlaces,
} from '../../mocks/search/searchPage.mock'
import './SearchPage.css'

const SEARCH_DELAY_MS = 250
const normalizeText = (value = '') => value.trim().toLowerCase()

export default function SearchPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [isResultMode, setIsResultMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resultItems, setResultItems] = useState([])
  const searchTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  const autocompleteItems = useMemo(() => {
    const normalized = normalizeText(keyword)
    if (!normalized) return mockAutocompleteKeywords

    return mockAutocompleteKeywords.filter((item) =>
      normalizeText(item).includes(normalized),
    )
  }, [keyword])

  const runSearch = (rawKeyword) => {
    const normalized = normalizeText(rawKeyword)

    if (!normalized) {
      setIsResultMode(false)
      setIsLoading(false)
      setResultItems([])
      return
    }

    setIsResultMode(true)
    setIsLoading(true)

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }

    searchTimerRef.current = window.setTimeout(() => {
      const filtered = mockSearchPlaces.filter(
        (item) =>
          normalizeText(item.title).includes(normalized) ||
          normalizeText(item.address).includes(normalized),
      )
      setResultItems(filtered)
      setIsLoading(false)
    }, SEARCH_DELAY_MS)
  }

  const handleChangeKeyword = (nextKeyword) => {
    setKeyword(nextKeyword)
    setIsResultMode(false)
    setIsLoading(false)

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }
  }

  const handleSelectAutocomplete = (selectedKeyword) => {
    setKeyword(selectedKeyword)

    const exactMatch = mockSearchPlaces.find(
      (item) => normalizeText(item.title) === normalizeText(selectedKeyword),
    )

    if (exactMatch) {
      handleSelectResult(exactMatch)
      return
    }

    runSearch(selectedKeyword)
  }

  const handleSelectResult = (selectedPlace) => {
    navigate('/map', {
      replace: true,
      state: { selectedSearchPlace: selectedPlace },
    })
  }

  return (
    <main className="search-page">
      <CommonHeader
        variant="search"
        onBack={() => navigate(-1)}
        searchProps={{
          value: keyword,
          onChange: handleChangeKeyword,
          onSearch: runSearch,
          placeholder: '건물, 장소 검색',
          ariaLabel: '건물 및 장소 검색',
          autoFocus: true,
        }}
      />

      <section className="search-page__content">
        {!isResultMode ? (
          <SearchAutocompleteList
            items={autocompleteItems}
            onSelect={handleSelectAutocomplete}
          />
        ) : null}

        {isResultMode && isLoading ? (
          <p className="search-page__state">검색 중</p>
        ) : null}

        {isResultMode && !isLoading && resultItems.length > 0 ? (
          <SearchResultList items={resultItems} onSelect={handleSelectResult} />
        ) : null}

        {isResultMode && !isLoading && resultItems.length === 0 ? (
          <p className="search-page__state">검색 결과가 없습니다.</p>
        ) : null}
      </section>
    </main>
  )
}
