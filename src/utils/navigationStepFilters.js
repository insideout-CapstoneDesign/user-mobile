const DISTANCE_TEXT_PATTERN = /\d+(?:\.\d+)?\s*(?:m|km)/i
const ACTION_INSTRUCTION_PATTERN =
  /좌회전|우회전|직진|유턴|계단|엘리베이터|에스컬레이터|횡단보도|따라|이동|통과/

export function isDistanceSummaryInstruction(instruction) {
  const text = normalizeInstruction(instruction)

  if (!text || isEndpointInstruction(text) || ACTION_INSTRUCTION_PATTERN.test(text)) {
    return false
  }

  return (
    isBareDistanceText(text) ||
    isLeadingCommaDistanceText(text) ||
    isNamedDistanceText(text)
  )
}

function isBareDistanceText(text) {
  return new RegExp(`^${DISTANCE_TEXT_PATTERN.source}$`, 'i').test(text)
}

function isLeadingCommaDistanceText(text) {
  return new RegExp(`^,\\s*${DISTANCE_TEXT_PATTERN.source}$`, 'i').test(text)
}

function isNamedDistanceText(text) {
  return new RegExp(`^.+?(?:,\\s*|\\s+)${DISTANCE_TEXT_PATTERN.source}$`, 'i').test(
    text,
  )
}

function isEndpointInstruction(text) {
  return text.includes('도착') || text.includes('출발') || text.includes('현재 위치')
}

function normalizeInstruction(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}
