import myLocateIcon from '../../assets/icons/MyLocate.svg'
import {
  CurrentLocationButton,
  GeoMessage,
} from './CurrentLocationControl.styles'

export default function CurrentLocationControl({
  isLocating = false,
  message = '',
  onLocate,
}) {
  return (
    <>
      <CurrentLocationButton
        type="button"
        onClick={onLocate}
        aria-label="현재 위치로 이동"
        disabled={isLocating}
      >
        <img src={myLocateIcon} alt="" aria-hidden="true" width="22" height="22" />
      </CurrentLocationButton>
      {message ? <GeoMessage>{message}</GeoMessage> : null}
    </>
  )
}
