import { useEffect, useMemo, useState } from 'react'
import { getPlaceDetail } from '../../apis/placeApi'
import BottomSheetBase from '../BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../BottomSheet/types/BottomSheetCompactInfo'
import BottomSheetPlaceDetail from '../BottomSheet/types/BottomSheetPlaceDetail'
import { AUTH_STORAGE_KEY } from '../../constants/auth'
import { demoReviewSummary, demoReviews } from '../../mocks/review.mock'

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
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const selectedPoiKeyFromPlace =
    place?.poiId ?? place?.destinationPoiId ?? place?.startPoiId ?? place?.publicId ?? null
  const resolvedIsRegistered = placeDetail?.isRegistered ?? isRegistered ?? false
  const sheetTitle =
    place?.parentBuildingName ??
    place?.displayName ??
    place?.title ??
    place?.name ??
    placeDetail?.name ??
    '장소명'

  useEffect(() => {
    if (!isOpen || !place) {
      setPlaceDetail(null)
      setIsDetailLoading(false)
      setShowPOIs(false)
      setSelectedFloor(null)
      setSelectedPoiId(null)
      setIsFavorite(false)
      return
    }

    let isActive = true
    setPlaceDetail(null)
    setIsDetailLoading(true)
    setShowPOIs(false)
    setSelectedFloor(null)
    setSelectedPoiId(null)
    setIsFavorite(false)

    getPlaceDetail({
      placeId: place.placeId ?? place.destinationBuildingId ?? null,
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
      .finally(() => {
        if (isActive) {
          setIsDetailLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [
    isOpen,
    place?.destinationBuildingId,
    place?.externalApiId,
    place?.id,
    place?.placeId,
  ])

  useEffect(() => {
    const updateLoginState = () => {
      setIsLoggedIn(Boolean(localStorage.getItem(AUTH_STORAGE_KEY.ACCESS_TOKEN)))
    }

    updateLoginState()

    window.addEventListener('storage', updateLoginState)
    return () => {
      window.removeEventListener('storage', updateLoginState)
    }
  }, [isOpen])

  const selectedPoiFromPlace = useMemo(() => {
    if (!placeDetail || !place || !resolvedIsRegistered) return null

    const selectedPlaceIds = [selectedPoiKeyFromPlace]
      .filter(Boolean)
      .map((value) => String(value))

    const detailFloors = Array.isArray(placeDetail?.floors) ? placeDetail.floors : []
    const normalizedPois = detailFloors.flatMap((floor) => {
      if (!Array.isArray(floor?.pois)) return []

      const floorLevel = Number.isFinite(Number(floor?.level)) ? Number(floor.level) : null

      return floor.pois.map((poi, index) => ({
        id:
          poi.poiId ??
          poi.id ??
          poi.externalApiId ??
          `${floor.floorId ?? floorLevel ?? 'floor'}-${index}`,
        name: poi.name ?? 'POI',
        floor: Number.isFinite(Number(poi.floor))
          ? Number(poi.floor)
          : floorLevel ?? 0,
        externalApiId: poi.externalApiId ?? null,
      }))
    })

    return normalizedPois.find((poi) => {
      const poiIds = [poi.id, poi.externalApiId].filter(Boolean).map((value) => String(value))

      return poiIds.some((value) => selectedPlaceIds.includes(value))
    })
  }, [place, placeDetail, resolvedIsRegistered, selectedPoiKeyFromPlace])

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
        name: sheetTitle,
        address: placeDetail?.address ?? place?.address ?? '주소 정보 없음',
        isRegistered: resolvedIsRegistered,
        hasIndoorMap: Boolean(placeDetail?.hasIndoorMap),
        floors: normalizedFloors,
      },
      pois: normalizedPois,
    }
  }, [place, placeDetail, sheetTitle])

  const selectedPoi = useMemo(() => {
    if (!selectedPoiId) return selectedPoiFromPlace

    return pois.find((poi) => poi.id === selectedPoiId) ?? selectedPoiFromPlace
  }, [pois, selectedPoiFromPlace, selectedPoiId])

  const routablePlace = useMemo(() => {
    if (!place) return null

    if (!selectedPoi) {
      return place
    }

    const selectedPoiIdentifier = selectedPoi.id ?? selectedPoi.externalApiId ?? null
    const buildingPlaceId = place.placeId ?? place.destinationBuildingId ?? null

    return {
      ...place,
      placeId: buildingPlaceId,
      poiId: selectedPoiIdentifier,
      name: selectedPoi.name ?? place.name,
      title: selectedPoi.name ?? place.title ?? place.name,
      publicId: selectedPoiIdentifier ?? buildingPlaceId,
      startPoiId: selectedPoiIdentifier,
      destinationPoiId: selectedPoiIdentifier,
      destinationBuildingId: buildingPlaceId,
    }
  }, [place, selectedPoi])

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
    <BottomSheetBase
      isOpen={isOpen}
      onClose={handleClose}
      scrollableContent={false}
    >
      {isDetailLoading || resolvedIsRegistered ? (
        <BottomSheetPlaceDetail
          isLoggedIn={isLoggedIn}
          building={building}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          onSelectFloor={setSelectedFloor}
          selectedFloor={selectedFloor}
          onDeparture={() => {
            onDeparture?.(routablePlace ?? place)
            handleClose()
          }}
          onArrival={() => {
            onArrival?.(routablePlace ?? place)
            handleClose()
          }}
          pois={pois}
          showPOIs={showPOIs}
          onTogglePOIs={() => setShowPOIs((prev) => !prev)}
          selectedPoiId={selectedPoiId}
          onSelectPoi={handleSelectPoi}
          reviewSummary={demoReviewSummary}
          reviews={demoReviews}
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
