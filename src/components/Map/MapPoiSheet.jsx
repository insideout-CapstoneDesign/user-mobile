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
  const placeKey = getPlaceSheetKey(place)
  const [placeDetailState, setPlaceDetailState] = useState({
    key: null,
    detail: null,
    loading: false,
    favorite: false,
  })
  const [poiPanelState, setPoiPanelState] = useState({
    key: null,
    showPOIs: false,
    selectedFloor: null,
    selectedPoiId: null,
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isCurrentPlaceDetail =
    Boolean(isOpen && placeKey) && placeDetailState.key === placeKey
  const placeDetail = isCurrentPlaceDetail ? placeDetailState.detail : null
  const isDetailLoading = Boolean(
    isOpen && place && (!isCurrentPlaceDetail || placeDetailState.loading),
  )
  const isFavorite = isCurrentPlaceDetail ? placeDetailState.favorite : false
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
      return undefined
    }

    let isActive = true

    getPlaceDetail({
      placeId: place.placeId ?? place.destinationBuildingId ?? null,
      externalApiId: place.externalApiId ?? null,
    })
      .then((detail) => {
        if (isActive) {
          setPlaceDetailState({
            key: placeKey,
            detail,
            loading: false,
            favorite: false,
          })
        }
      })
      .catch(() => {
        if (isActive) {
          setPlaceDetailState({
            key: placeKey,
            detail: null,
            loading: false,
            favorite: false,
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [
    isOpen,
    place,
    place?.destinationBuildingId,
    place?.externalApiId,
    place?.id,
    place?.placeId,
    placeKey,
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
  }, [place, placeDetail, resolvedIsRegistered, sheetTitle])

  const hasPoiPanelState = poiPanelState.key === placeKey
  const selectedPoiId = hasPoiPanelState
    ? poiPanelState.selectedPoiId
    : selectedPoiFromPlace?.id ?? null
  const selectedFloor = hasPoiPanelState
    ? poiPanelState.selectedFloor
    : normalizeFloorNumber(selectedPoiFromPlace?.floor)
  const showPOIs = hasPoiPanelState
    ? poiPanelState.showPOIs
    : Boolean(selectedPoiFromPlace)

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

  const handleClose = () => {
    setPoiPanelState({
      key: placeKey,
      showPOIs: false,
      selectedFloor: null,
      selectedPoiId: null,
    })
    onClose?.()
  }

  const handleSelectPoi = (poi) => {
    if (!poi) return

    setPoiPanelState({
      key: placeKey,
      showPOIs: true,
      selectedFloor: normalizeFloorNumber(poi.floor),
      selectedPoiId: poi.id ?? null,
    })
  }

  const handleSelectFloor = (floor) => {
    setPoiPanelState((currentState) => ({
      key: placeKey,
      showPOIs: currentState.key === placeKey ? currentState.showPOIs : false,
      selectedFloor: floor,
      selectedPoiId:
        currentState.key === placeKey ? currentState.selectedPoiId : null,
    }))
  }

  const handleTogglePOIs = () => {
    setPoiPanelState((currentState) => ({
      key: placeKey,
      showPOIs:
        currentState.key === placeKey
          ? !currentState.showPOIs
          : !selectedPoiFromPlace,
      selectedFloor:
        currentState.key === placeKey
          ? currentState.selectedFloor
          : normalizeFloorNumber(selectedPoiFromPlace?.floor),
      selectedPoiId:
        currentState.key === placeKey
          ? currentState.selectedPoiId
          : selectedPoiFromPlace?.id ?? null,
    }))
  }

  const handleToggleFavorite = () => {
    setPlaceDetailState((currentState) => ({
      key: placeKey,
      detail: currentState.key === placeKey ? currentState.detail : placeDetail,
      loading: currentState.key === placeKey ? currentState.loading : false,
      favorite: currentState.key === placeKey ? !currentState.favorite : true,
    }))
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
          onToggleFavorite={handleToggleFavorite}
          onSelectFloor={handleSelectFloor}
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
          onTogglePOIs={handleTogglePOIs}
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

function getPlaceSheetKey(place) {
  return (
    place?.placeId ??
    place?.destinationBuildingId ??
    place?.externalApiId ??
    place?.id ??
    place?.publicId ??
    null
  )
}

function normalizeFloorNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null
}
