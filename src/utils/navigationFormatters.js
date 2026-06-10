export function formatDuration(seconds) {
  const minutes = secondsToMinutes(seconds)
  return formatMinutes(minutes)
}

export function formatTotalDuration(totalDuration, totalTimeSeconds, options = {}) {
  const formattedTotalDuration = formatDurationText(totalDuration)

  if (formattedTotalDuration) {
    const normalizedDuration = formattedTotalDuration
      .replace(/\s*\+\s*/g, ' +')
      .replace(/\s*실내\s*이동/g, '실내이동')

    return options.indoorPrefix
      ? moveIndoorMarkerToPrefix(normalizedDuration)
      : normalizedDuration
  }

  return formatDuration(totalTimeSeconds)
}

function moveIndoorMarkerToPrefix(durationText) {
  const marker = '+실내이동'
  const markerIndex = durationText.indexOf(marker)

  if (markerIndex < 0) {
    return durationText
  }

  const mainText = durationText.slice(0, markerIndex).trim()

  return `실내이동+ ${mainText}`
}

export function formatDurationText(durationText) {
  if (typeof durationText !== 'string') {
    return null
  }

  const normalizedText = durationText.trim()

  if (!normalizedText) {
    return null
  }

  return normalizedText.replace(/(\d+)\s*분/g, (match, minutesText) => {
    const minutes = Number(minutesText)
    return minutes >= 60 ? formatMinutes(minutes) : match.replace(/\s+/g, '')
  })
}

export function formatMinutes(minutes) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) {
    return null
  }

  if (minutes < 60) {
    return `${minutes}분`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0
    ? `${hours}시간 ${remainingMinutes}분`
    : `${hours}시간`
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
