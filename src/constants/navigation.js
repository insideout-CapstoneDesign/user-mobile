export const NAVIGATION_ROUTES_PATH = '/api/v1/navigation/routes'
export const NAVIGATION_TRANSIT_ROUTES_PATH = '/api/v1/navigation/transit/routes'
export const REQUEST_TIMEOUT_MS = 10000

export const NAVIGATION_NOT_FOUND_CODES = [
  'NAVIGATION404_1',
  'NAVIGATION404_2',
  'NAVIGATION404_3',
]

export const ROUTE_TYPE_BY_TRANSPORT_MODE = {
  car: 'CAR',
  transit: 'TRANSIT',
  walk: 'WALK',
}

export const ROUTE_OPTION_META = {
  TRANSIT_CANDIDATE: {
    label: '대중교통',
    extraInfo: null,
  },
  RECOMMENDED: {
    label: '내비 추천',
    extraInfo: null,
  },
  MIN_TIME: {
    label: '최소 시간',
    extraInfo: null,
  },
  SHORTEST: {
    label: '최단 거리',
    extraInfo: null,
  },
  COMFORTABLE: {
    label: '편안한 길',
    extraInfo: '계단과 장애물을 덜 지나는 경로',
  },
}

export const UI_TYPE_BY_LEG_MODE = {
  BUS: 'bus',
  CAR: 'car',
  SUBWAY: 'subway',
  WALK: 'walk',
  INDOOR: 'indoor',
  CAMPUS: 'campus',
  OTHER: 'point',
}
