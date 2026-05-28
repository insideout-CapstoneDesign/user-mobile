export function buildTransitDetailLegs(routeOption) {
  const rawLegs = routeOption?.raw?.legs

  if (Array.isArray(rawLegs) && rawLegs.length > 0) {
    return rawLegs
      .map((leg, index) => toRawTransitDetailLeg(leg, routeOption.id, index))
      .filter((leg) => leg.title || leg.startName)
  }

  return (routeOption?.steps ?? []).map((step, index) =>
    toSummaryTransitDetailLeg(step, routeOption.id, index),
  )
}

function toRawTransitDetailLeg(leg, routeId, index) {
  const type = getRawLegType(leg.mode)
  const isTransit = type === 'bus' || type === 'subway'

  if (!isTransit) {
    return {
      id: `${routeId}-raw-detail-${index}`,
      type: 'walk',
      title: buildRawWalkTitle(leg),
      detail: leg.description ?? leg.instruction ?? null,
    }
  }

  return {
    id: `${routeId}-raw-detail-${index}`,
    type,
    routeColor: leg.routeColor,
    line: leg.routeNm ?? leg.routeName,
    startName: leg.startName ?? leg.fromName ?? '승차 지점',
    startDetail: leg.startDetail ?? leg.startStationId ?? null,
    stopCount: leg.stopCount ?? leg.stations?.length ?? 0,
    durationText: formatRawDuration(leg.durationSeconds),
    stops: leg.stations ?? leg.stops ?? [],
    endName: leg.endName ?? leg.toName ?? '하차 지점',
    endDetail: leg.endDetail ?? null,
  }
}

function toSummaryTransitDetailLeg(step, routeId, index) {
  const type = step.type ?? 'walk'
  const isTransit = type === 'bus' || type === 'subway'

  if (!isTransit) {
    return {
      id: `${routeId}-detail-${index}`,
      type: type === 'point' ? 'point' : 'walk',
      title: step.name,
      detail: step.sub,
    }
  }

  return {
    id: `${routeId}-detail-${index}`,
    type,
    line: step.sub,
    startName: step.name,
    stopCount: 0,
    durationText: '',
    stops: [],
    endName: '하차 지점',
  }
}

function getRawLegType(mode) {
  if (mode === 'SUBWAY') return 'subway'
  if (mode === 'BUS') return 'bus'

  return 'walk'
}

function buildRawWalkTitle(leg) {
  const distance = leg.distanceMeters ? `${Math.round(leg.distanceMeters)}m` : ''
  const duration = formatRawDuration(leg.durationSeconds)
  const meta = [distance, duration].filter(Boolean).join(' · ')

  return meta ? `도보 ${meta}` : '도보 이동'
}

function formatRawDuration(durationSeconds) {
  if (typeof durationSeconds !== 'number') {
    return ''
  }

  return `${Math.max(Math.round(durationSeconds / 60), 1)}분`
}
