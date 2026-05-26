import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPlaces } from '../../apis/placeApi'
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import SearchAutocompleteList from '../../components/Search/SearchAutocompleteList'
import SearchResultList from '../../components/Search/SearchResultList'
import { mockAutocompleteKeywords } from '../../mocks/search/searchPage.mock'
import './SearchPage.css'

const SEARCH_DELAY_MS = 250
const SEARCH_RADIUS_METERS = 3000
const normalizeText = (value = '') => value.trim().toLowerCase()
const GEOLOCATION_UNAVAILABLE_MESSAGE = '현재 위치 정보를 사용할 수 없습니다.'
const GEOLOCATION_REQUIRED_MESSAGE = '현재 위치를 확인한 뒤 다시 검색해 주세요.'

export default function SearchPage() {
  const navigate = useNavigate()
  const supportsGeolocation =
    typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [keyword, setKeyword] = useState('')
  const [isResultMode, setIsResultMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearchError, setHasSearchError] = useState(false)
  const [searchStateMessage, setSearchStateMessage] = useState(
    supportsGeolocation ? '' : GEOLOCATION_UNAVAILABLE_MESSAGE,
  )
  const [searchCenter, setSearchCenter] = useState(null)
  const [resultItems, setResultItems] = useState([])
  const searchTimerRef = useRef(null)
  const requestSeqRef = useRef(0)

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!supportsGeolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSearchCenter({
          lat: coords.latitude,
          lng: coords.longitude,
        })
      },
      () => {
        setSearchStateMessage(GEOLOCATION_REQUIRED_MESSAGE)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [supportsGeolocation])

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
      setHasSearchError(false)
      setSearchStateMessage('')
      setResultItems([])
      return
    }

    if (!searchCenter) {
      setIsResultMode(true)
      setIsLoading(false)
      setHasSearchError(true)
      setSearchStateMessage(GEOLOCATION_REQUIRED_MESSAGE)
      setResultItems([])
      return
    }

    setIsResultMode(true)
    setIsLoading(true)
    setHasSearchError(false)
    setSearchStateMessage('')

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }

    const requestId = ++requestSeqRef.current

    searchTimerRef.current = window.setTimeout(async () => {
      try {
        const places = await searchPlaces({
          keyword: normalized,
          lat: searchCenter.lat,
          lng: searchCenter.lng,
          radius: SEARCH_RADIUS_METERS,
        })
        if (requestId !== requestSeqRef.current) return

        const mappedPlaces = places.map((place, idx) => ({
          id: place.externalApiId ?? `${place.name}-${idx}`,
          title: place.name,
          address: place.roadAddress || place.address || '주소 정보 없음',
          isRegistered: Boolean(place.isRegistered),
          lat: place.lat,
          lng: place.lng,
          externalApiId: place.externalApiId,
        }))

        setResultItems(mappedPlaces)
      } catch {
        if (requestId !== requestSeqRef.current) return
        setHasSearchError(true)
        setSearchStateMessage('검색 결과를 불러오지 못했습니다.')
        setResultItems([])
      } finally {
        if (requestId === requestSeqRef.current) {
          setIsLoading(false)
        }
      }
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
    runSearch(selectedKeyword)
  }

  const handleSelectResult = (selectedPlace) => {
    navigate('/map', {
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
          <p className="search-page__state">
            {hasSearchError
              ? searchStateMessage || '검색 결과를 불러오지 못했습니다.'
              : '검색 결과가 없습니다.'}
          </p>
        ) : null}
      </section>
    </main>
  )
}
