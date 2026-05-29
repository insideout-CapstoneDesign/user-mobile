export function formatDuration(seconds) {
  const minutes = secondsToMinutes(seconds)
  return minutes === null ? null : `${minutes}분`
}

export function formatTotalDuration(totalDuration, totalTimeSeconds) {
  if (totalDuration) {
    return totalDuration.replace(/\s*\+\s*/g, '+').replace(/\s*실내\s*이동/g, '실내이동')
  }

  return formatDuration(totalTimeSeconds)
}

export function secondsToMinutes(seconds) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
    return null
  }

  return Math.max(1, Math.ceil(seconds / 60))
}

export function formatDistance(meters) {
  if (typeof meters !== 'number' || Number.isNaN(meters)) {
    return null
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`
  }

  return `${meters}m`
}
