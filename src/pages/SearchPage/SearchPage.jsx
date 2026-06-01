import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { searchPlaces, suggestPlaces } from '../../apis/placeApi'
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import SearchAutocompleteList from '../../components/Search/SearchAutocompleteList'
import SearchResultList from '../../components/Search/SearchResultList'
import { ROUTES } from '../../constants/routes'
import { SEARCH_MODES } from '../../constants/search'
import './SearchPage.css'

const SEARCH_DELAY_MS = 250
const SUGGEST_DELAY_MS = 180
const SEARCH_SIZE = 15
const SUGGEST_SIZE = 10
const normalizeText = (value = '') => value.trim().toLowerCase()
const HANGUL_JAMO_ONLY_REGEX = /^[ㄱ-ㅎㅏ-ㅣ]+$/
const GEOLOCATION_UNAVAILABLE_MESSAGE = '현재 위치 정보를 사용할 수 없습니다.'
const GEOLOCATION_REQUIRED_MESSAGE = '현재 위치를 확인한 뒤 다시 검색해 주세요.'
const SEARCH_FAILED_MESSAGE = '검색 결과를 불러오지 못했습니다.'

function isInvalidIntermediateKeyword(keyword) {
  return HANGUL_JAMO_ONLY_REGEX.test(keyword)
}

export default function SearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchMode = location.state?.mode
  const routeField = location.state?.routeField
  const returnTo = location.state?.returnTo ?? ROUTES.ROUTING_SEARCH
  const routeOrigin = location.state?.routeOrigin ?? null
  const routeDestination = location.state?.routeDestination ?? null
  const selectedMapPlace = location.state?.selectedMapPlace ?? null
  const mapCenter = location.state?.mapCenter ?? null
  const mapLevel = location.state?.mapLevel ?? null
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
  const [autocompleteItems, setAutocompleteItems] = useState([])
  const [resultItems, setResultItems] = useState([])
  const searchTimerRef = useRef(null)
  const suggestTimerRef = useRef(null)
  const requestSeqRef = useRef(0)
  const suggestSeqRef = useRef(0)

  const invalidatePendingSearch = () => {
    requestSeqRef.current += 1
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }
  }

  const invalidatePendingSuggest = () => {
    suggestSeqRef.current += 1
    if (suggestTimerRef.current) {
      window.clearTimeout(suggestTimerRef.current)
      suggestTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      requestSeqRef.current += 1
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }
      suggestSeqRef.current += 1
      if (suggestTimerRef.current) {
        window.clearTimeout(suggestTimerRef.current)
        suggestTimerRef.current = null
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

  const suggestByKeyword = (rawKeyword) => {
    const normalized = normalizeText(rawKeyword)

    if (!normalized || isInvalidIntermediateKeyword(normalized)) {
      invalidatePendingSuggest()
      setAutocompleteItems([])
      return
    }

    if (suggestTimerRef.current) {
      window.clearTimeout(suggestTimerRef.current)
      suggestTimerRef.current = null
    }

    const requestId = ++suggestSeqRef.current

    suggestTimerRef.current = window.setTimeout(async () => {
      try {
        const suggestions = await suggestPlaces({
          keyword: normalized,
          lat: searchCenter?.lat,
          lng: searchCenter?.lng,
          size: SUGGEST_SIZE,
        })

        if (requestId !== suggestSeqRef.current) return

        const mappedSuggestions = suggestions.map((item, idx) => ({
          id: item.externalApiId ?? `${item.name}-${idx}`,
          title: item.name,
          address: item.roadAddress || item.address || '주소 정보 없음',
          isRegistered: Boolean(item.isRegistered),
          lat: item.lat,
          lng: item.lng,
          externalApiId: item.externalApiId,
          distanceMeters: item.distanceMeters ?? null,
        }))

        setAutocompleteItems(mappedSuggestions)
      } catch {
        if (requestId !== suggestSeqRef.current) return
        setAutocompleteItems([])
      }
    }, SUGGEST_DELAY_MS)
  }

  const runSearch = (rawKeyword) => {
    const normalized = normalizeText(rawKeyword)

    if (!normalized || isInvalidIntermediateKeyword(normalized)) {
      invalidatePendingSearch()
      setIsResultMode(false)
      setIsLoading(false)
      setHasSearchError(false)
      setSearchStateMessage('')
      setResultItems([])
      return
    }

    if (!searchCenter) {
      invalidatePendingSearch()
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
      searchTimerRef.current = null
    }

    const requestId = ++requestSeqRef.current

    searchTimerRef.current = window.setTimeout(async () => {
      try {
        const places = await searchPlaces({
          keyword: normalized,
          lat: searchCenter?.lat,
          lng: searchCenter?.lng,
          size: SEARCH_SIZE,
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
          distanceMeters: place.distanceMeters ?? null,
        }))

        setResultItems(mappedPlaces)
      } catch (error) {
        if (requestId !== requestSeqRef.current) return
        setHasSearchError(true)
        setSearchStateMessage(error?.message || SEARCH_FAILED_MESSAGE)
        setResultItems([])
      } finally {
        if (requestId === requestSeqRef.current) {
          setIsLoading(false)
        }
      }
    }, SEARCH_DELAY_MS)
  }

  const handleChangeKeyword = (nextKeyword) => {
    invalidatePendingSearch()
    setKeyword(nextKeyword)
    setIsResultMode(false)
    setIsLoading(false)
    setHasSearchError(false)
    setSearchStateMessage('')
    setResultItems([])
    suggestByKeyword(nextKeyword)
  }

  const handleSelectAutocomplete = (selectedItem) => {
    setKeyword(selectedItem.title)
    runSearch(selectedItem.title)
  }

  const handleSelectResult = (selectedPlace) => {
    if (searchMode === SEARCH_MODES.ROUTE) {
      const nextOrigin = routeField === 'origin' ? selectedPlace : routeOrigin
      const nextDestination =
        routeField === 'destination' ? selectedPlace : routeDestination

      navigate(returnTo, {
        state: {
          routeOrigin: nextOrigin,
          routeDestination: nextDestination,
          selectedMapPlace,
          mapCenter,
          mapLevel,
          selectedRouteField: routeField,
        },
      })
      return
    }

    navigate(ROUTES.MAP, {
      state: {
        selectedSearchPlace: selectedPlace,
        openSheetFrom: 'search-result',
        routeOrigin,
        routeDestination,
        mapCenter,
        mapLevel,
        selectedMapPlace,
      },
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
              ? searchStateMessage || SEARCH_FAILED_MESSAGE
              : '검색 결과가 없습니다.'}
          </p>
        ) : null}
      </section>
    </main>
  )
}
