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
const GEOLOCATION_INITIAL_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
}
const GEOLOCATION_WATCH_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}
const normalizeText = (value = '') => value.trim().toLowerCase()
const HANGUL_JAMO_ONLY_REGEX = /^[ㄱ-ㅎㅏ-ㅣ]+$/
const GEOLOCATION_UNAVAILABLE_MESSAGE = '현재 위치 정보를 사용할 수 없습니다.'
const GEOLOCATION_REQUIRED_MESSAGE = '현재 위치를 확인한 뒤 다시 검색해 주세요.'
const SEARCH_FAILED_MESSAGE = '검색 결과를 불러오지 못했습니다.'
const DEBUG_SUGGEST_LOG = import.meta.env.DEV && import.meta.env.VITE_DEBUG_SUGGEST_LOG === 'true'

function isInvalidIntermediateKeyword(keyword) {
  return HANGUL_JAMO_ONLY_REGEX.test(keyword)
}

function getNowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function mapPlaceToSearchItem(place, idx) {
  const baseName = place.name ?? place.title ?? '장소명'
  const displayName =
    place.displayName ??
    (place.parentBuildingName ? `${place.parentBuildingName} · ${baseName}` : null)
  const placeId = place.placeId ?? place.destinationBuildingId ?? place.buildingPlaceId ?? null
  const poiId = place.poiId ?? place.destinationPoiId ?? place.startPoiId ?? null

  return {
    placeId,
    poiId,
    publicId: place.publicId ?? place.externalApiId ?? poiId ?? placeId ?? null,
    startPoiId: place.startPoiId ?? poiId,
    destinationPoiId: place.destinationPoiId ?? poiId,
    destinationBuildingId: place.destinationBuildingId ?? place.placeId ?? null,
    id: place.externalApiId ?? poiId ?? placeId ?? `${baseName}-${idx}`,
    name: baseName,
    title: baseName,
    displayName,
    parentBuildingName: place.parentBuildingName ?? null,
    address: place.roadAddress || place.address || '주소 정보 없음',
    isRegistered: Boolean(place.isRegistered),
    lat: place.lat,
    lng: place.lng,
    externalApiId: place.externalApiId,
    distanceMeters: place.distanceMeters ?? null,
  }
}

function getPlaceCenter(place, fallbackCenter = null) {
  const lat = place?.lat
  const lng = place?.lng

  if (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    typeof lng === 'number' &&
    Number.isFinite(lng)
  ) {
    return { lat, lng }
  }

  return fallbackCenter
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
  const mountedAtRef = useRef(getNowMs())
  const lastLocationUpdatedAtRef = useRef(null)

  const getCenterParams = () => ({
    lat: searchCenter?.lat,
    lng: searchCenter?.lng,
  })

  const clearTimer = (timerRef) => {
    if (!timerRef.current) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const invalidatePendingSearch = () => {
    requestSeqRef.current += 1
    clearTimer(searchTimerRef)
  }

  const invalidatePendingSuggest = () => {
    suggestSeqRef.current += 1
    clearTimer(suggestTimerRef)
  }

  useEffect(() => {
    return () => {
      requestSeqRef.current += 1
      clearTimer(searchTimerRef)
      suggestSeqRef.current += 1
      clearTimer(suggestTimerRef)
    }
  }, [])

  useEffect(() => {
    if (!supportsGeolocation) return

    const handleSuccess = ({ coords }) => {
      const updatedAt = getNowMs()
      lastLocationUpdatedAtRef.current = updatedAt
      setSearchCenter({
        lat: coords.latitude,
        lng: coords.longitude,
      })

      if (DEBUG_SUGGEST_LOG) {
        console.debug('[search][geo:update]', {
          elapsedMsFromMount: Math.round(updatedAt - mountedAtRef.current),
          lat: coords.latitude,
          lng: coords.longitude,
        })
      }
    }

    const handleError = () => {
      setSearchStateMessage(GEOLOCATION_REQUIRED_MESSAGE)
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      GEOLOCATION_INITIAL_OPTIONS,
    )

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      ...GEOLOCATION_WATCH_OPTIONS,
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [supportsGeolocation])

  const suggestByKeyword = (rawKeyword) => {
    const normalized = normalizeText(rawKeyword)

    if (!normalized || isInvalidIntermediateKeyword(normalized)) {
      invalidatePendingSuggest()
      setAutocompleteItems([])
      return
    }

    clearTimer(suggestTimerRef)

    const requestId = ++suggestSeqRef.current

    suggestTimerRef.current = window.setTimeout(async () => {
      try {
        const { lat, lng } = getCenterParams()

        if (DEBUG_SUGGEST_LOG) {
          const now = getNowMs()
          console.debug('[search][suggest:req]', {
            q: normalized,
            lat: lat ?? null,
            lng: lng ?? null,
            size: SUGGEST_SIZE,
            elapsedMsFromMount: Math.round(now - mountedAtRef.current),
            elapsedMsAfterGeoUpdate: lastLocationUpdatedAtRef.current
              ? Math.round(now - lastLocationUpdatedAtRef.current)
              : null,
          })
        }

        const suggestions = await suggestPlaces({
          keyword: normalized,
          lat,
          lng,
          size: SUGGEST_SIZE,
        })

        if (requestId !== suggestSeqRef.current) return

        setAutocompleteItems(suggestions.map(mapPlaceToSearchItem))
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

    setIsResultMode(true)
    setIsLoading(true)
    setHasSearchError(false)
    setSearchStateMessage('')

    clearTimer(searchTimerRef)

    const requestId = ++requestSeqRef.current

    searchTimerRef.current = window.setTimeout(async () => {
      try {
        const { lat, lng } = getCenterParams()
        const places = await searchPlaces({
          keyword: normalized,
          lat,
          lng,
          size: SEARCH_SIZE,
        })
        if (requestId !== requestSeqRef.current) return

        setResultItems(places.map(mapPlaceToSearchItem))
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
    const selectedMapCenter = getPlaceCenter(selectedPlace, mapCenter)

    if (searchMode === SEARCH_MODES.ROUTE) {
      const nextOrigin = routeField === 'origin' ? selectedPlace : routeOrigin
      const nextDestination =
        routeField === 'destination' ? selectedPlace : routeDestination
      const nextRoute = nextOrigin && nextDestination
        ? ROUTES.ROUTING_OPTION
        : returnTo

      navigate(nextRoute, {
        state: {
          routeOrigin: nextOrigin,
          routeDestination: nextDestination,
          selectedMapPlace,
          mapCenter: selectedMapCenter,
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
          mapCenter: selectedMapCenter,
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
