import { useEffect, useRef, useState } from 'react'
import { getNearestPlace } from '../../apis/placeApi'
import { isValidMapCenter } from '../../utils/map/mapViewport'
import { mapNearestPlaceToPoi } from '../../utils/map/mapPoiMappers'

const NEAREST_RADIUS_METERS = 30
const NOTICE_TIMEOUT_MS = 2400
const NO_PLACE_CODE = 'PLACE_INFO_NOT_AVAILABLE'

export default function useMapPoiSelection({ initialSelectedPoi, setMapCenter }) {
  const [mapNotice, setMapNotice] = useState('')
  const [selectedPoi, setSelectedPoi] = useState(initialSelectedPoi)
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState(() =>
    isValidMapCenter({
      lat: initialSelectedPoi?.lat,
      lng: initialSelectedPoi?.lng,
    })
      ? { lat: initialSelectedPoi.lat, lng: initialSelectedPoi.lng }
      : null,
  )
  const requestSeqRef = useRef(0)
  const noticeTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current)
      }
    }
  }, [])

  const showMapNotice = (message) => {
    setMapNotice(message)

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current)
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setMapNotice('')
    }, NOTICE_TIMEOUT_MS)
  }

  const closePoiSheet = () => {
    setSelectedPoi(null)
    setSelectedMarkerPosition(null)
  }

  const handleCurrentLocationSelect = ({ lat, lng }) => {
    setMapCenter({ lat, lng })
    setSelectedPoi(null)
    setSelectedMarkerPosition({ lat, lng })
    setMapNotice('')
  }

  const handleMapClick = async ({ lat, lng }) => {
    const requestId = ++requestSeqRef.current

    try {
      const { place, code } = await getNearestPlace({
        lat,
        lng,
        radius: NEAREST_RADIUS_METERS,
      })

      if (requestId !== requestSeqRef.current) return

      if (!place) {
        setSelectedPoi(null)
        setSelectedMarkerPosition(null)
        if (code === NO_PLACE_CODE || code === 'PLACE200_1') {
          showMapNotice('해당 위치의 장소 정보를 찾을 수 없어요.')
        }
        return
      }

      const mappedPoi = mapNearestPlaceToPoi(place)
      setMapNotice('')
      setSelectedPoi(mappedPoi)
      setMapCenter({
        lat: mappedPoi.lat,
        lng: mappedPoi.lng,
      })
      setSelectedMarkerPosition({
        lat: mappedPoi.lat,
        lng: mappedPoi.lng,
      })
    } catch (error) {
      if (requestId !== requestSeqRef.current) return
      setSelectedPoi(null)
      setSelectedMarkerPosition(null)
      showMapNotice(error?.message ?? '장소 정보를 불러오지 못했습니다.')
    }
  }

  return {
    mapNotice,
    selectedPoi,
    selectedMarkerPosition,
    closePoiSheet,
    handleCurrentLocationSelect,
    handleMapClick,
  }
}
