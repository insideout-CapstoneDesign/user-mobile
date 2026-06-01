import FloorSelector from '../../../components/Floor/FloorSelector'
import NavigationMapOverlay from '../../../components/NavigationGuidance/NavigationMapOverlay'
import TransitTurnByTurnList from '../../../components/NavigationGuidance/TransitTurnByTurnList'
import TurnByTurnList from '../../../components/NavigationGuidance/TurnByTurnList'

export default function RoutingGuidanceLayer({ routing, onBackToRouteOptions }) {
  const {
    activeGuidanceStep,
    boundedGuidanceStepIndex,
    guidanceSteps,
    guidanceView,
    isIndoorGuidanceStep,
    isTransitGuidance,
    navigationRoute,
    routeDestination,
    routeOrigin,
    transitDetailLegs,
  } = routing

  return (
    <>
      <NavigationMapOverlay
        origin={routeOrigin.name}
        destination={routeDestination?.name ?? '도착지'}
        step={activeGuidanceStep}
        activeIndex={boundedGuidanceStepIndex}
        total={guidanceSteps.length}
        onBack={routing.openGuidanceList}
        onClose={routing.resetRouteView}
        onRouteClick={routing.openGuidanceList}
        onPrevious={() => routing.moveGuidanceStep(-1)}
        onNext={() => routing.moveGuidanceStep(1)}
      />

      {isIndoorGuidanceStep && navigationRoute.mapFloors.length > 0 ? (
        <div className="routing-page__guidance-floor">
          <FloorSelector
            buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
            floors={navigationRoute.mapFloors}
            activeFloor={navigationRoute.selectedFloorplan}
            onSelect={routing.selectFloorplan}
          />
        </div>
      ) : null}

      {guidanceView === 'list' ? (
        isTransitGuidance ? (
          <TransitTurnByTurnList
            origin={routeOrigin.name}
            destination={routeDestination?.name ?? '도착지'}
            route={navigationRoute.selectedRouteOption}
            legs={transitDetailLegs}
            onBack={onBackToRouteOptions}
            onClose={routing.resetRouteView}
          />
        ) : (
          <TurnByTurnList
            origin={routeOrigin.name}
            destination={routeDestination?.name ?? '도착지'}
            route={navigationRoute.selectedRouteOption}
            steps={guidanceSteps}
            activeStepId={activeGuidanceStep?.id}
            onBack={onBackToRouteOptions}
            onClose={routing.resetRouteView}
            onSelectStep={routing.selectGuidanceStep}
          />
        )
      ) : null}
    </>
  )
}
