export function firstIntegerId(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
      return value
    }

    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
      const parsed = Number(value)
      if (Number.isSafeInteger(parsed)) {
        return parsed
      }
    }
  }

  return null
}
