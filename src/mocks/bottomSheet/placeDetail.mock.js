import {
  mockBuilding,
  mockPOIs,
  mockReviews,
  mockReviewSummary,
} from './buildingDetail.mock'

export function getPlaceDetailMock(place) {
  return {
    building: {
      ...mockBuilding,
      name: place?.name ?? mockBuilding.name,
      address: place?.address ?? mockBuilding.address,
      hasIndoorMap: true,
    },
    pois: mockPOIs,
    reviews: mockReviews,
    reviewSummary: mockReviewSummary,
  }
}
