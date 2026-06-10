export function firstIntegerId(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
      return value
    }

    const trimmed = typeof value === 'string' ? value.trim() : value
    if (typeof trimmed === 'string' && /^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed)
      if (Number.isSafeInteger(parsed)) {
        return parsed
      }
    }
  }

  return null
}
