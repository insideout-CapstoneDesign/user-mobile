export function normalizeRouteColor(color) {
  if (!color) {
    return null
  }

  const value = String(color).trim()

  if (value.startsWith('#') || value.startsWith('var(')) {
    return value
  }

  return `#${value}`
}
