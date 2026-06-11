export const STEP_TYPE = {
  ARRIVAL: 'ARRIVAL',
}

export function isArrivalStep(step = {}) {
  return Boolean(step?.arrival) || step?.stepType === STEP_TYPE.ARRIVAL
}
