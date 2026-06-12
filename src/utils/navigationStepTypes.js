export const STEP_TYPE = {
  ARRIVAL: 'ARRIVAL',
}

export function isArrivalStep(step = {}) {
  return Boolean(step?.arrival) || step?.stepType === STEP_TYPE.ARRIVAL
}

export function isIndoorStep(step = {}) {
  const safeStep = step && typeof step === 'object' ? step : {}
  const mode = String(safeStep.mode ?? '').toUpperCase()

  return (
    safeStep.type === 'indoor' ||
    safeStep.type === 'campus' ||
    mode === 'INDOOR' ||
    mode === 'CAMPUS' ||
    Boolean(safeStep.floorId)
  )
}
