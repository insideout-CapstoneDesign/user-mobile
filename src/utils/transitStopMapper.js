const STOP_ARRAY_KEY_PATTERN = /(station|stop|정류|역|pass|via|intermediate)/i

export function getTransitStopName(stop) {
  if (stop && typeof stop === 'object') {
    return (
      stop.name ??
      stop.stationName ??
      stop.stationNm ??
      stop.stopName ??
      stop.stopNm ??
      stop.title ??
      ''
    )
  }

  return stop
}

export function getIntermediateStops(leg, startName, endName) {
  const stops = getRawStopCandidates(leg)
    .flatMap(normalizeStopCandidate)
    .filter((stop) => getTransitStopName(stop))

  return removeEndpointStops(dedupeStops(stops), startName, endName)
}

function getRawStopCandidates(leg) {
  const directCandidates = [
    leg.stations,
    leg.stops,
    leg.passStations,
    leg.passStationList,
    leg.passStops,
    leg.passStopList,
    leg.viaStations,
    leg.viaStationList,
    leg.viaStops,
    leg.viaStopList,
    leg.intermediateStations,
    leg.intermediateStops,
    leg.stationList,
    leg.stopList,
    leg.pathStations,
    leg.pathStops,
    getStepStops(leg.steps),
  ].filter(Boolean)

  return [...directCandidates, ...getNestedStopCandidates(leg)]
}

function getStepStops(steps) {
  if (!Array.isArray(steps)) {
    return []
  }

  return steps
    .map((step) => ({
      name:
        step.stationName ??
        step.stationNm ??
        step.stopName ??
        step.stopNm ??
        step.name ??
        step.title ??
        null,
    }))
    .filter((stop) => stop.name)
}

function normalizeStopCandidate(candidate) {
  if (Array.isArray(candidate)) {
    return candidate
  }

  if (typeof candidate === 'string') {
    return candidate
      .split(/[,>→]/)
      .map((name) => name.trim())
      .filter(Boolean)
  }

  return [candidate]
}

function getNestedStopCandidates(value, parentKey = '', visited = new WeakSet()) {
  if (!value || typeof value !== 'object' || visited.has(value)) {
    return []
  }

  visited.add(value)

  return Object.entries(value).flatMap(([key, child]) => {
    if (Array.isArray(child)) {
      const nestedArrays = child.flatMap((item) =>
        getNestedStopCandidates(item, key, visited),
      )

      return STOP_ARRAY_KEY_PATTERN.test(`${parentKey} ${key}`)
        ? [child, ...nestedArrays]
        : nestedArrays
    }

    if (child && typeof child === 'object') {
      return getNestedStopCandidates(child, key, visited)
    }

    return []
  })
}

function removeEndpointStops(stops, startName, endName) {
  const normalizedStartName = normalizeStopName(startName)
  const normalizedEndName = normalizeStopName(endName)

  return stops.filter((stop) => {
    const name = normalizeStopName(getTransitStopName(stop))

    return name && name !== normalizedStartName && name !== normalizedEndName
  })
}

function dedupeStops(stops) {
  const seen = new Set()

  return stops.filter((stop) => {
    const name = normalizeStopName(getTransitStopName(stop))

    if (!name || seen.has(name)) {
      return false
    }

    seen.add(name)
    return true
  })
}

function normalizeStopName(value) {
  return String(value ?? '').replace(/\s+/g, '').trim()
}
