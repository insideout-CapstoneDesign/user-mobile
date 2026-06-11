import escalatorIcon from '../../../assets/icons/escalator.svg'
import elevatorIcon from '../../../assets/icons/elevator.svg'
import {
  clamp,
  geoJsonToPath,
  geoJsonToPoint,
  getGeometryBounds,
  getGeometryType,
  toPositiveNumber,
} from './floorplanGeometry'

export function normalizePublishedMap(mapData) {
  if (!mapData) {
    return null
  }

  const width = toPositiveNumber(mapData.floorplanWidthPx)
  const height = toPositiveNumber(mapData.floorplanHeightPx)

  if (!width || !height) {
    return null
  }

  return {
    imageUrl: mapData.floorplanImageUrl ?? null,
    size: { width, height },
    zones: normalizeZones(mapData.zones),
    objects: normalizeFloorplanObjects(mapData.floorplanObjects),
    pois: normalizePois(mapData.pois),
  }
}

function normalizeZones(zones) {
  if (!Array.isArray(zones)) {
    return []
  }

  return zones
    .map((zone, index) => {
      const path = geoJsonToPath(zone?.geomPx)
      if (!path) return null

      return {
        id: zone.id ?? `zone-${index}`,
        path,
        fill: 'rgba(229, 231, 235, 0.72)',
        stroke: 'rgba(17, 24, 39, 0.28)',
      }
    })
    .filter(Boolean)
}

function normalizeFloorplanObjects(objects) {
  if (!Array.isArray(objects)) {
    return []
  }

  return objects
    .map((object, index) => {
      const path = geoJsonToPath(object?.geomPx)
      if (!path) return null

      const kind = String(object?.kind ?? '').toLowerCase()
      const isArea = getGeometryType(object?.geomPx) === 'Polygon'

      return {
        id: object.id ?? `object-${index}`,
        path,
        fill: isArea ? 'rgba(17, 24, 39, 0.08)' : 'none',
        stroke: kind.includes('wall') ? '#111111' : '#2f2f2f',
        strokeWidth: kind.includes('wall') ? 3.2 : 2.2,
      }
    })
    .filter(Boolean)
}

function normalizePois(pois) {
  if (!Array.isArray(pois)) {
    return []
  }

  return pois
    .map((poi, index) => {
      const point = geoJsonToPoint(poi?.geomPx)
      if (!point) return null
      const labelBox = getGeometryBounds(poi?.footprintPx)
      const label = buildPoiLabel(poi.name, labelBox)
      const icon = resolvePoiIcon(poi)

      return {
        id: poi.id ?? `poi-${index}`,
        name: poi.name ?? '',
        x: labelBox?.center.x ?? point.x,
        y: labelBox?.center.y ?? point.y,
        lines: label.lines,
        fontSize: label.fontSize,
        icon,
        iconSize: resolvePoiIconSize(labelBox),
      }
    })
    .filter(Boolean)
}

function resolvePoiIcon(poi) {
  const searchText = [
    poi?.name,
    poi?.code,
    ...(Array.isArray(poi?.tags) ? poi.tags : []),
    poi?.attrs?.type,
    poi?.attrs?.kind,
    poi?.attrs?.category,
    poi?.attrs?.label,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    searchText.includes('elevator') ||
    searchText.includes('엘리베이터') ||
    searchText.includes('엘레베이터')
  ) {
    return elevatorIcon
  }

  if (
    searchText.includes('escalator') ||
    searchText.includes('에스컬레이터') ||
    searchText.includes('에스칼레이터')
  ) {
    return escalatorIcon
  }

  return null
}

function resolvePoiIconSize(bounds) {
  if (!bounds) {
    return 34
  }

  return clamp(Math.min(bounds.width, bounds.height) * 0.82, 26, 42)
}

function buildPoiLabel(name, bounds) {
  const cleanName = String(name ?? '').trim()
  if (!cleanName) {
    return { lines: [], fontSize: 14 }
  }

  const maxWidth = Math.max((bounds?.width ?? 96) - 12, 42)
  const maxHeight = Math.max((bounds?.height ?? 42) - 8, 22)
  const wordLines = cleanName.includes(' ')
    ? cleanName.split(/\s+/).filter(Boolean)
    : [cleanName]

  const candidateLines = compactPoiLabelLines(wordLines, maxWidth, 20)
  const fontSize = resolvePoiLabelFontSize(candidateLines, maxWidth, maxHeight)

  return {
    lines: compactPoiLabelLines(wordLines, maxWidth, fontSize),
    fontSize,
  }
}

function compactPoiLabelLines(words, maxWidth, fontSize) {
  if (words.length <= 1) {
    return words
  }

  const lines = []

  words.forEach((word) => {
    const lastLine = lines[lines.length - 1]
    const candidate = lastLine ? `${lastLine} ${word}` : word

    if (lastLine && estimateTextWidth(candidate, fontSize) <= maxWidth) {
      lines[lines.length - 1] = candidate
      return
    }

    lines.push(word)
  })

  return lines
}

function resolvePoiLabelFontSize(lines, maxWidth, maxHeight) {
  for (let fontSize = 20; fontSize >= 12; fontSize -= 1) {
    const widestLine = Math.max(
      ...lines.map((line) => estimateTextWidth(line, fontSize)),
      0,
    )
    const totalHeight = lines.length * fontSize * 1.18

    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      return fontSize
    }
  }

  return 12
}

function estimateTextWidth(text, fontSize) {
  return [...String(text ?? '')].reduce((width, character) => {
    if (character === ' ') {
      return width + fontSize * 0.34
    }

    return width + fontSize * (/[ -~]/.test(character) ? 0.58 : 0.92)
  }, 0)
}
