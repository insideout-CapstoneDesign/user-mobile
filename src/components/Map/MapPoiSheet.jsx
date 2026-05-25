import { useMemo, useState } from 'react'
import BottomSheetBase from '../BottomSheet/BottomSheetBase'
import BottomSheetCompactInfo from '../BottomSheet/types/BottomSheetCompactInfo'
import BottomSheetPlaceDetail from '../BottomSheet/types/BottomSheetPlaceDetail'
import { getPlaceDetailMock } from '../../mocks/bottomSheet/placeDetail.mock'

export default function MapPoiSheet({ isOpen, place, isRegistered, onClose }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPOIs, setShowPOIs] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState(null)

  const { building, pois, reviews, reviewSummary } = useMemo(
    () => getPlaceDetailMock(place),
    [place],
  )

  const handleClose = () => {
    setShowPOIs(false)
    setSelectedFloor(null)
    onClose?.()
  }

  return (
    <BottomSheetBase isOpen={isOpen} onClose={handleClose}>
      {isRegistered ? (
        <BottomSheetPlaceDetail
          isLoggedIn={false}
          building={building}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          onSelectFloor={setSelectedFloor}
          selectedFloor={selectedFloor}
          onDeparture={handleClose}
          onArrival={handleClose}
          pois={pois}
          showPOIs={showPOIs}
          onTogglePOIs={() => setShowPOIs((prev) => !prev)}
          reviewSummary={reviewSummary}
          reviews={reviews}
        />
      ) : (
        <BottomSheetCompactInfo
          place={place}
          onDeparture={handleClose}
          onArrival={handleClose}
        />
      )}
    </BottomSheetBase>
  )
}
