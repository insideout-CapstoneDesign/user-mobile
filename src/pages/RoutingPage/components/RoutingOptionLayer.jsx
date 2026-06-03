import FloorSelector from '../../../components/Floor/FloorSelector'
import DirectionSearch from '../../../components/Direction/DirectionSearch'
import TransportSelector from '../../../components/Transport/TransportSelector'

export default function RoutingOptionLayer({ routing }) {
  const { navigationRoute, routeDestination, routeOrigin, transportMode } = routing
  const originName = routeOrigin?.name ?? '출발지'
  const destinationName = routeDestination?.name ?? '도착지'

  return (
    <>
      <div className="routing-page__direction">
        <DirectionSearch
          origin={originName}
          destination={destinationName}
          onSwap={routing.swapRoute}
          onBack={routing.resetRouteView}
        />
      </div>

      <div className="routing-page__transport">
        <TransportSelector
          activeMode={transportMode}
          onSelect={routing.selectTransportMode}
        />
      </div>

      {navigationRoute.mapFloors.length > 0 ? (
        <div className="routing-page__floor">
          <FloorSelector
            buildingName={navigationRoute.selectedFloorplan?.mapType ?? '도면'}
            floors={navigationRoute.mapFloors}
            activeFloor={navigationRoute.selectedFloorplan}
            onSelect={routing.selectFloorplan}
          />
        </div>
      ) : null}
    </>
  )
}
