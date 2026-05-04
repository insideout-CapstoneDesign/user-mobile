export const mockBuilding = {
  name: '공학관',
  address: '서울시 관악구 관악로 1',
  hasIndoorMap: true,
  floors: [-3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

export const mockPOIs = [
  { id: 'poi-1', name: 'B3 기계실', floor: -3 },
  { id: 'poi-2', name: 'B2 주차장 출입구', floor: -2 },
  { id: 'poi-3', name: 'B1 창고', floor: -1 },
  { id: 'poi-4', name: '101호 안내데스크', floor: 1 },
  { id: 'poi-5', name: '편의점 CU', floor: 1 },
  { id: 'poi-6', name: '201호 강의실', floor: 2 },
  { id: 'poi-7', name: '302호 실험실', floor: 3 },
  { id: 'poi-8', name: '401호 세미나실', floor: 4 },
  { id: 'poi-9', name: '카페테리아', floor: 5 },
  { id: 'poi-10', name: '열람실', floor: 5 },
  { id: 'poi-11', name: '601호 강의실', floor: 6 },
  { id: 'poi-12', name: '701호 교수연구실', floor: 7 },
  { id: 'poi-13', name: '801호 프로젝트룸', floor: 8 },
  { id: 'poi-14', name: '901호 회의실', floor: 9 },
  { id: 'poi-15', name: '1001호 라운지', floor: 10 },
  { id: 'poi-16', name: '1101호 미디어실', floor: 11 },
  { id: 'poi-17', name: '1201호 옥상정원 출입구', floor: 12 },
]

export const mockReviewSummary = {
  rating: 4.5,
  count: 128,
}

export const mockReviews = [
  {
    id: 'review-1',
    user: 'user123',
    rating: 5,
    content: '시설이 깨끗하고 찾기 쉬워요!',
  },
  {
    id: 'review-2',
    user: 'student_a',
    rating: 4,
    content: '엘리베이터가 조금 느려요.',
  },
  {
    id: 'review-3',
    user: 'insideout_lover',
    rating: 5,
    content: '실내지도 연동이 정확해서 길 찾기 편해요.',
  },
  {
    id: 'review-4',
    user: 'campus_walk',
    rating: 4,
    content: '층별 POI가 잘 정리되어 있어서 좋았습니다.',
  },
  {
    id: 'review-5',
    user: 'new_user_01',
    rating: 3,
    content: '초반 로딩이 조금 길었지만 기능은 만족해요.',
  },
  {
    id: 'review-6',
    user: 'map_helper',
    rating: 5,
    content: '출발/도착 설정이 직관적이라 바로 사용할 수 있었어요.',
  },
]
