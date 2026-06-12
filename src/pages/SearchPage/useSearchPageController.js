import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { searchPlaces, suggestPlaces } from '../../apis/placeApi'
import { ROUTES } from '../../constants/routes'
import { SEARCH_MODES } from '../../constants/search'
import { firstIntegerId } from '../../utils/idHelpers'

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
const RECENT_SEARCH_STORAGE_KEY = 'recent-search-keywords'
const MAX_RECENT_SEARCHES = 8

function isInvalidIntermediateKeyword(keyword) {
  return HANGUL_JAMO_ONLY_REGEX.test(keyword)
}

function toFiniteNumber(value) {
  const normalized =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN

  return Number.isFinite(normalized) ? normalized : null
}

function mapPlaceToSearchItem(place, idx) {
  const baseName = place.name ?? place.title ?? '장소명'
  const displayName =
    place.displayName ??
    (place.parentBuildingName ? `${place.parentBuildingName} · ${baseName}` : null)
  const placeId = place.placeId ?? place.destinationBuildingId ?? place.buildingPlaceId ?? null
  const poiId = firstIntegerId(
    place.poiId,
    place.poiPublicId,
    place.destinationPoiId,
    place.startPoiId,
  )

  return {
    placeId,
    poiId,
    publicId: place.publicId ?? place.externalApiId ?? poiId ?? placeId ?? null,
    startPoiId: firstIntegerId(place.startPoiId, poiId),
    destinationPoiId: firstIntegerId(place.destinationPoiId, poiId),
    destinationBuildingId: place.destinationBuildingId ?? place.placeId ?? null,
    id: place.externalApiId ?? poiId ?? placeId ?? `${baseName}-${idx}`,
    name: baseName,
    title: baseName,
    displayName,
    parentBuildingName: place.parentBuildingName ?? null,
    address: place.roadAddress || place.address || '주소 정보 없음',
    isRegistered: Boolean(place.isRegistered),
    lat: toFiniteNumber(place.lat),
    lng: toFiniteNumber(place.lng),
    externalApiId: place.externalApiId,
    distanceMeters: place.distanceMeters ?? null,
  }
}

function getPlaceCenter(place, fallbackCenter = null) {
  const lat = toFiniteNumber(place?.lat)
  const lng = toFiniteNumber(place?.lng)

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

function loadRecentSearchKeywords() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const savedKeywords = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY)

    if (!savedKeywords) {
      return []
    }

    const parsedKeywords = JSON.parse(savedKeywords)

    if (!Array.isArray(parsedKeywords)) {
      return []
    }

    return parsedKeywords.filter(
      (keyword) => typeof keyword === 'string' && keyword.trim(),
    )
  } catch {
    return []
  }
}

function saveRecentSearchKeyword(rawKeyword, currentKeywords) {
  const trimmedKeyword = rawKeyword.trim()

  if (!trimmedKeyword || typeof window === 'undefined') {
    return currentKeywords
  }

  const normalizedKeyword = normalizeText(trimmedKeyword)
  const nextKeywords = [
    trimmedKeyword,
    ...currentKeywords.filter(
      (keyword) => normalizeText(keyword) !== normalizedKeyword,
    ),
  ].slice(0, MAX_RECENT_SEARCHES)

  try {
    window.localStorage.setItem(
      RECENT_SEARCH_STORAGE_KEY,
      JSON.stringify(nextKeywords),
    )
  } catch {
    return currentKeywords
  }

  return nextKeywords
}

function removeRecentSearchKeyword(targetKeyword, currentKeywords) {
  const normalizedTargetKeyword = normalizeText(targetKeyword)
  const nextKeywords = currentKeywords.filter(
    (keyword) => normalizeText(keyword) !== normalizedTargetKeyword,
  )

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        RECENT_SEARCH_STORAGE_KEY,
        JSON.stringify(nextKeywords),
      )
    } catch {
      return currentKeywords
    }
  }

  return nextKeywords
}

function clearRecentSearchKeywords() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    window.localStorage.removeItem(RECENT_SEARCH_STORAGE_KEY)
  } catch {
    return loadRecentSearchKeywords()
  }

  return []
}

export default function useSearchPageController() {
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
  const [recentKeywords, setRecentKeywords] = useState(() => loadRecentSearchKeywords())
  const [autocompleteItems, setAutocompleteItems] = useState([])
  const [resultItems, setResultItems] = useState([])
  const searchTimerRef = useRef(null)
  const suggestTimerRef = useRef(null)
  const requestSeqRef = useRef(0)
  const suggestSeqRef = useRef(0)

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

  useEffect(
    () => () => {
      requestSeqRef.current += 1
      clearTimer(searchTimerRef)
      suggestSeqRef.current += 1
      clearTimer(suggestTimerRef)
    },
    [],
  )

  useEffect(() => {
    if (!supportsGeolocation) return undefined

    const handleSuccess = ({ coords }) => {
      setSearchCenter({
        lat: coords.latitude,
        lng: coords.longitude,
      })
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
    const trimmedKeyword = rawKeyword.trim()

    if (!normalized || isInvalidIntermediateKeyword(normalized)) {
      invalidatePendingSearch()
      setIsResultMode(false)
      setIsLoading(false)
      setHasSearchError(false)
      setSearchStateMessage('')
      setResultItems([])
      return
    }

    setRecentKeywords((currentKeywords) =>
      saveRecentSearchKeyword(trimmedKeyword, currentKeywords),
    )
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

  const handleSelectRecentKeyword = (selectedKeyword) => {
    setKeyword(selectedKeyword)
    runSearch(selectedKeyword)
  }

  const handleRemoveRecentKeyword = (targetKeyword) => {
    setRecentKeywords((currentKeywords) =>
      removeRecentSearchKeyword(targetKeyword, currentKeywords),
    )
  }

  const handleClearRecentKeywords = () => {
    setRecentKeywords(clearRecentSearchKeywords())
  }

  const handleSelectResult = (selectedPlace) => {
    const selectedMapCenter = getPlaceCenter(selectedPlace, mapCenter)

    if (searchMode === SEARCH_MODES.ROUTE) {
      navigate(ROUTES.MAP, {
        state: {
          routeOrigin,
          routeDestination,
          selectedSearchPlace: selectedPlace,
          openSheetFrom: 'search-result',
          selectedMapPlace,
          mapCenter: selectedMapCenter,
          mapLevel,
          returnTo,
          routeField,
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

  return {
    keyword,
    isResultMode,
    isLoading,
    hasSearchError,
    searchStateMessage,
    recentKeywords,
    autocompleteItems,
    resultItems,
    handleChangeKeyword,
    handleSelectAutocomplete,
    handleRemoveRecentKeyword,
    handleClearRecentKeywords,
    handleSelectRecentKeyword,
    handleSelectResult,
    runSearch,
  }
}
