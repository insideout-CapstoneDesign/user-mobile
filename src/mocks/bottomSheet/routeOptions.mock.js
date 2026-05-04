export const mockTransitRouteOptions = [
  {
    id: 'transit-shortest',
    totalTime: '35분',
    active: true,
    segments: [
      { type: 'walk', minutes: 3 },
      { type: 'bus', minutes: 25, color: 'var(--green-500)', line: '146' },
      { type: 'walk', minutes: 7 },
    ],
    steps: [
      { type: 'bus', name: '강남역', sub: '146번 탑승' },
      { type: 'point', name: '원동물병원 앞' },
    ],
  },
  {
    id: 'transit-comfort',
    totalTime: '39분',
    active: false,
    segments: [
      { type: 'walk', minutes: 4 },
      { type: 'subway', minutes: 22, color: 'var(--blue-900)', line: '2호선' },
      { type: 'walk', minutes: 13 },
    ],
    steps: [
      { type: 'subway', name: '서울대입구역', sub: '2호선 탑승' },
      { type: 'point', name: '관악구청 정류장 하차' },
    ],
  },
  {
    id: 'transit-transfer',
    totalTime: '43분',
    active: false,
    segments: [
      { type: 'walk', minutes: 3 },
      { type: 'bus', minutes: 14, color: 'var(--green-500)', line: '5511' },
      { type: 'walk', minutes: 4 },
      { type: 'subway', minutes: 17, color: 'var(--blue-900)', line: '2호선' },
      { type: 'walk', minutes: 5 },
    ],
    steps: [
      { type: 'bus', name: '공학관 정류장', sub: '5511번 탑승' },
      { type: 'walk', name: '서울대입구역 환승 이동', sub: '도보 4분' },
      { type: 'subway', name: '서울대입구역', sub: '2호선 탑승' },
      { type: 'point', name: '학생회관 도착' },
    ],
  },
]

export const mockWalkRouteOptions = [
  {
    id: 'walk-shortest',
    name: '최단 거리',
    time: '20분',
    distance: '1.2km',
    extraInfo: '계단 1회',
  },
  {
    id: 'walk-comfortable',
    name: '편안한 길',
    time: '23분',
    distance: '1.3km',
  },
]

export const mockCarRouteOptions = [
  {
    id: 'car-fastest',
    name: '내비 추천',
    time: '9분',
    distance: '2.8km',
  },
  {
    id: 'car-smooth',
    name: '최소 시간',
    time: '11분',
    distance: '3.1km',
  },
]
