const bottomNavRouteMap = {
  map: '/map',
  navigation: '/RoutingSearchPage',
  my: '/my',
}

export default function getBottomNavRoute(key) {
  return bottomNavRouteMap[key] ?? '/map'
}
