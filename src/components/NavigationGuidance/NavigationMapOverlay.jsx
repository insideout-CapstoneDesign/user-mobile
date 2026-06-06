import CommonHeader from '../CommonHeader/CommonHeader'
import GuidanceStepCard from './GuidanceStepCard'
import {
  OverlayCardSlot,
  OverlayRoot,
} from './NavigationMapOverlay.styles'

export default function NavigationMapOverlay({
  origin = '현재 위치',
  destination = '목적지',
  step,
  activeIndex,
  onBack,
  onClose,
  onRouteClick,
  onPrevious,
  onNext,
}) {
  return (
    <OverlayRoot>
      <CommonHeader
        variant="routeInfo"
        origin={origin}
        destination={destination}
        onBack={onBack}
        onClose={onClose}
        onRouteClick={onRouteClick}
      />

      <OverlayCardSlot>
        <GuidanceStepCard
          step={step}
          activeIndex={activeIndex}
          onPrevious={onPrevious}
          onNext={onNext}
          onClick={onRouteClick}
        />
      </OverlayCardSlot>
    </OverlayRoot>
  )
}
