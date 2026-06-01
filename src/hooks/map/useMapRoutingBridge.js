import { getNearestPlace } from '../../apis/placeApi'
import { ROUTES } from '../../constants/routes'
import { DEFAULT_ROUTE_ORIGIN } from '../../utils/map/navigationPlaceMapper'
import {
  createCurrentLocationOrigin,
  mapPoiToRoutingPlace,
} from '../../utils/map/mapPoiMappers'

const NEAREST_RADIUS_METERS = 30

function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation-unavailable'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
        })
      },
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  })
}

export default function useMapRoutingBridge({
  navigate,
  routeOrigin,
  routeDestination,
  mapCenter,
  mapLevel,
  setCurrentNav,
}) {
  const openSearchPage = () => {
    navigate(ROUTES.SEARCH, {
      state: {
        routeOrigin,
        routeDestination,
        mapCenter,
        mapLevel,
      },
    })
  }

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSearchPage()
    }
  }

  const handleBottomNavChange = (key) => {
    if (key === 'navigation') {
      navigate(ROUTES.ROUTING_SEARCH, {
        state: {
          routeOrigin,
          routeDestination,
          mapCenter,
          mapLevel,
        },
      })
      return
    }

    setCurrentNav(key)
  }

  const openRoutingFromMapPoi = async (field, place) => {
    if (!place) return

    const normalizedPlace = mapPoiToRoutingPlace(place)
    const nextState =
      field === 'origin'
        ? {
            routeOrigin: normalizedPlace,
            routeDestination: routeDestination ?? null,
            selectedRouteField: 'destination',
          }
        : {
            routeOrigin:
              !routeOrigin || routeOrigin?.source === 'current-location'
                ? null
                : routeOrigin,
            routeDestination: normalizedPlace,
            selectedRouteField: 'origin',
          }

    if (field === 'destination' && !nextState.routeOrigin) {
      let originLat = mapCenter?.lat
      let originLng = mapCenter?.lng

      try {
        const currentPosition = await getCurrentPositionAsync()
        originLat = currentPosition.lat
        originLng = currentPosition.lng
      } catch {
        // 현재 위치 권한 실패 시 지도 중심 좌표를 fallback으로 사용합니다.
      }

      if (typeof originLat === 'number' && typeof originLng === 'number') {
        try {
          const { place: nearestPlace } = await getNearestPlace({
            lat: originLat,
            lng: originLng,
            radius: NEAREST_RADIUS_METERS,
          })
          const currentAddress =
            nearestPlace?.roadAddress ||
            nearestPlace?.address ||
            nearestPlace?.name ||
            '현재 위치'

          nextState.routeOrigin = createCurrentLocationOrigin({
            lat: originLat,
            lng: originLng,
            address: currentAddress,
          })
        } catch {
          nextState.routeOrigin = createCurrentLocationOrigin({
            lat: originLat,
            lng: originLng,
            address: '현재 위치',
          })
        }
      } else {
        nextState.routeOrigin = DEFAULT_ROUTE_ORIGIN
      }
    }

    navigate(ROUTES.ROUTING_SEARCH, {
      state: {
        ...nextState,
        selectedMapPlace: normalizedPlace,
        mapCenter,
        mapLevel,
      },
    })
  }

  return {
    openSearchPage,
    handleSearchInputKeyDown,
    handleBottomNavChange,
    openRoutingFromMapPoi,
  }
}
