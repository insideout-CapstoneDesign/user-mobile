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
  const originName = routeOrigin?.name ?? '출발지'
  const destinationName = routeDestination?.name ?? '도착지'

  return (
    <>
      <NavigationMapOverlay
        origin={originName}
        destination={destinationName}
        step={activeGuidanceStep}
        steps={guidanceSteps}
        activeIndex={boundedGuidanceStepIndex}
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
            origin={originName}
            destination={destinationName}
            route={navigationRoute.selectedRouteOption}
            legs={transitDetailLegs}
            activeStepId={activeGuidanceStep?.id}
            indoorBuildingName={navigationRoute.data?.indoor?.buildingName}
            onBack={onBackToRouteOptions}
            onClose={routing.resetRouteView}
            onSelectLeg={routing.selectTransitDetailLeg}
            onSelectStep={routing.selectGuidanceStep}
          />
        ) : (
          <TurnByTurnList
            origin={originName}
            destination={destinationName}
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
