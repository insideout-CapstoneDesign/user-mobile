import { useEffect, useMemo, useState } from 'react'
import { getPlaceDetail } from '../../apis/placeApi'
import BottomSheetBase from '../BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../BottomSheet/types/BottomSheetCompactInfo'
import BottomSheetPlaceDetail from '../BottomSheet/types/BottomSheetPlaceDetail'

const normalizeText = (value = '') => value.trim().toLowerCase()

export default function MapPoiSheet({
  isOpen,
  place,
  isRegistered,
  onClose,
  onDeparture,
  onArrival,
}) {
  const [showPOIs, setShowPOIs] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [selectedPoiId, setSelectedPoiId] = useState(null)
  const [placeDetail, setPlaceDetail] = useState(null)

  useEffect(() => {
    if (!isOpen || !place || !isRegistered) {
      setPlaceDetail(null)
      setShowPOIs(false)
      setSelectedFloor(null)
      setSelectedPoiId(null)
      return
    }

    let isActive = true
    setPlaceDetail(null)
    setShowPOIs(false)
    setSelectedFloor(null)
    setSelectedPoiId(null)

    getPlaceDetail({
      placeId: place.placeId ?? null,
      externalApiId: place.externalApiId ?? null,
    })
      .then((detail) => {
        if (isActive) {
          setPlaceDetail(detail)
        }
      })
      .catch(() => {
        if (isActive) {
          setPlaceDetail(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [isOpen, isRegistered, place?.externalApiId, place?.id, place?.placeId])

  const selectedPoiFromPlace = useMemo(() => {
    if (!placeDetail || !place || !isRegistered) return null

    const selectedPlaceName = normalizeText(place.name ?? place.title ?? '')
    const selectedPlaceIds = [place.placeId, place.externalApiId, place.id]
      .filter(Boolean)
      .map((value) => String(value))

    const detailFloors = Array.isArray(placeDetail?.floors) ? placeDetail.floors : []
    const normalizedPois = detailFloors.flatMap((floor) => {
      if (!Array.isArray(floor?.pois)) return []

      const floorLevel = Number.isFinite(Number(floor?.level)) ? Number(floor.level) : null

      return floor.pois.map((poi, index) => ({
        id: poi.id ?? poi.externalApiId ?? `${floor.floorId ?? floorLevel ?? 'floor'}-${index}`,
        name: poi.name ?? 'POI',
        floor: Number.isFinite(Number(poi.floor))
          ? Number(poi.floor)
          : floorLevel ?? 0,
        externalApiId: poi.externalApiId ?? null,
      }))
    })

    return normalizedPois.find((poi) => {
      const poiIds = [poi.id, poi.externalApiId].filter(Boolean).map((value) => String(value))

      return (
        poiIds.some((value) => selectedPlaceIds.includes(value)) ||
        normalizeText(poi.name) === selectedPlaceName
      )
    })
  }, [isRegistered, place, placeDetail])

  const { building, pois } = useMemo(() => {
    const detailFloors = Array.isArray(placeDetail?.floors) ? placeDetail.floors : []

    const normalizedFloors = detailFloors
      .map((floor) => {
        const level = Number.isFinite(Number(floor?.level))
          ? Number(floor.level)
          : null

        return level
      })
      .filter((level) => level !== null)

    const normalizedPois = detailFloors.flatMap((floor) => {
      if (!Array.isArray(floor?.pois)) return []

      const floorLevel = Number.isFinite(Number(floor?.level)) ? Number(floor.level) : null

      return floor.pois.map((poi, index) => ({
        id: poi.id ?? poi.externalApiId ?? `${floor.floorId ?? floorLevel ?? 'floor'}-${index}`,
        name: poi.name ?? 'POI',
        floor: Number.isFinite(Number(poi.floor))
          ? Number(poi.floor)
          : floorLevel ?? 0,
        externalApiId: poi.externalApiId ?? null,
      }))
    })

    return {
      building: {
        name: placeDetail?.name ?? place?.name ?? '장소명',
        address: placeDetail?.address ?? place?.address ?? '주소 정보 없음',
        hasIndoorMap: Boolean(placeDetail?.hasIndoorMap),
        floors: normalizedFloors,
      },
      pois: normalizedPois,
    }
  }, [place, placeDetail])

  useEffect(() => {
    if (!selectedPoiFromPlace) return

    setSelectedPoiId(selectedPoiFromPlace.id ?? null)
    setSelectedFloor(
      Number.isFinite(Number(selectedPoiFromPlace.floor))
        ? Number(selectedPoiFromPlace.floor)
        : null,
    )
    setShowPOIs(true)
  }, [selectedPoiFromPlace])

  const handleClose = () => {
    setShowPOIs(false)
    setSelectedFloor(null)
    setSelectedPoiId(null)
    onClose?.()
  }

  const handleSelectPoi = (poi) => {
    if (!poi) return

    setSelectedPoiId(poi.id ?? null)
    setSelectedFloor(Number.isFinite(Number(poi.floor)) ? Number(poi.floor) : null)
    setShowPOIs(true)
  }

  return (
    <BottomSheetBase isOpen={isOpen} onClose={handleClose}>
      {isRegistered ? (
        <BottomSheetPlaceDetail
          isLoggedIn={false}
          building={building}
          onSelectFloor={setSelectedFloor}
          selectedFloor={selectedFloor}
          onDeparture={() => {
            onDeparture?.(place)
            handleClose()
          }}
          onArrival={() => {
            onArrival?.(place)
            handleClose()
          }}
          pois={pois}
          showPOIs={showPOIs}
          onTogglePOIs={() => setShowPOIs((prev) => !prev)}
          selectedPoiId={selectedPoiId}
          onSelectPoi={handleSelectPoi}
          reviewSummary={{ rating: 0, count: 0 }}
          reviews={[]}
        />
      ) : (
        <BottomSheetCompactInfo
          place={place}
          onDeparture={() => {
            onDeparture?.(place)
            handleClose()
          }}
          onArrival={() => {
            onArrival?.(place)
            handleClose()
          }}
        />
      )}
    </BottomSheetBase>
  )
}
