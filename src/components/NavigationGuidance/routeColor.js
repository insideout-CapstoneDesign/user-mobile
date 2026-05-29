const HEX_COLOR_PATTERN = /^(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

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
