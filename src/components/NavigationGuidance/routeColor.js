const HEX_COLOR_PATTERN = /^(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function getRouteDisplayColor(type, color) {
  const normalizedColor = normalizeRouteColor(color)

  if (type === 'walk') return 'var(--gray-200)'
  if (normalizedColor) return normalizedColor
  if (type === 'bus' || type === 'campus') return 'var(--green-500)'
  if (type === 'subway') return 'var(--blue-900)'
  if (type === 'car') return 'var(--blue-500)'
  if (type === 'indoor') return 'var(--blue-600)'
  return 'var(--gray-500)'
}

export function normalizeRouteColor(color) {
  if (!color) {
    return null
  }

  const value = String(color).trim()

  if (value.startsWith('#') || value.startsWith('var(')) {
    return value
  }

  if (HEX_COLOR_PATTERN.test(value)) {
    return `#${value}`
  }

  return value
}
