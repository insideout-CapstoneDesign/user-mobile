const PARENTHETICAL_TEXT_PATTERN = /\([^)]*\)/g
const SUBWAY_LINE_PATTERN = /(?:[0-9]+|[가-힣A-Za-z]+)\s*호선/
const SUBWAY_NOISE_PATTERN = /수도권|서울|지하철|도시철도|급행|완행|일반/g
const BUS_TYPE_WORDS = '간선|지선|광역|마을|일반|급행|직행|좌석|입석|공항|순환|버스'
const LEADING_BUS_TYPE_PATTERN = new RegExp(`^(${BUS_TYPE_WORDS})\\s*[:：-]?\\s*`)
const INLINE_BUS_TYPE_PATTERN = new RegExp(`(^|\\s)(${BUS_TYPE_WORDS})\\s*[:：-]?\\s*`, 'g')

export function simplifyTransitLineName(rawName, type) {
  if (!rawName) {
    return null
  }

  const name = String(rawName).trim()

  if (type === 'subway') {
    return simplifySubwayName(name)
  }

  if (type === 'bus') {
    return simplifyBusName(name)
  }

  return name
}

function simplifySubwayName(name) {
  const withoutParentheses = name.replace(PARENTHETICAL_TEXT_PATTERN, ' ')
  const lineMatch = withoutParentheses.match(SUBWAY_LINE_PATTERN)

  if (lineMatch) {
    return removeWhitespace(lineMatch[0])
  }

  return normalizeSpaces(withoutParentheses.replace(SUBWAY_NOISE_PATTERN, ' '))
}

function simplifyBusName(name) {
  return normalizeSpaces(
    name
      .replace(LEADING_BUS_TYPE_PATTERN, '')
      .replace(INLINE_BUS_TYPE_PATTERN, ' '),
  )
}

function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function removeWhitespace(value) {
  return value.replace(/\s+/g, '')
}
