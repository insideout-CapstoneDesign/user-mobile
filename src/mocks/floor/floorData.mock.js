import { mockBuilding } from '../bottomSheet/buildingDetail.mock';

export const mockFloorList = mockBuilding.floors.map(f => 
  f < 0 ? `B${Math.abs(f)}` : `${f}F`
);