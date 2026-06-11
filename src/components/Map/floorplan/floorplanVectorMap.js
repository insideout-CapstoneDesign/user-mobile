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

const DEFAULT_POI_ICON_SIZE = 34
// Icon scale and bounds keep facility glyphs legible inside small POI footprints.
const POI_ICON_SCALE = 0.82
const POI_ICON_MIN_SIZE = 26
const POI_ICON_MAX_SIZE = 42
const POI_LABEL_HORIZONTAL_PADDING = 12
const POI_LABEL_MIN_WIDTH = 42
const POI_LABEL_VERTICAL_PADDING = 8
const POI_LABEL_MIN_HEIGHT = 22
const POI_LABEL_DEFAULT_WIDTH = 96
const POI_LABEL_DEFAULT_HEIGHT = 42
const MIN_POI_FONT_SIZE = 12
const MAX_POI_FONT_SIZE = 20
const POI_LINE_HEIGHT_MULTIPLIER = 1.18
const SPACE_WIDTH_FACTOR = 0.34
const LATIN_WIDTH_FACTOR = 0.58
const CJK_WIDTH_FACTOR = 0.92
const DEFAULT_WIDTH_FACTOR = 0.72
const NARROW_CHARACTER_PATTERN = /[\p{Script=Latin}\p{Script=Common}]/u
const CJK_CHARACTER_PATTERN =
  /[\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u

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
    return DEFAULT_POI_ICON_SIZE
  }

  return clamp(
    Math.min(bounds.width, bounds.height) * POI_ICON_SCALE,
    POI_ICON_MIN_SIZE,
    POI_ICON_MAX_SIZE,
  )
}

function buildPoiLabel(name, bounds) {
  const cleanName = String(name ?? '').trim()
  if (!cleanName) {
    return { lines: [], fontSize: 14 }
  }

  const maxWidth = Math.max(
    (bounds?.width ?? POI_LABEL_DEFAULT_WIDTH) - POI_LABEL_HORIZONTAL_PADDING,
    POI_LABEL_MIN_WIDTH,
  )
  const maxHeight = Math.max(
    (bounds?.height ?? POI_LABEL_DEFAULT_HEIGHT) - POI_LABEL_VERTICAL_PADDING,
    POI_LABEL_MIN_HEIGHT,
  )
  const wordLines = cleanName.includes(' ')
    ? cleanName.split(/\s+/).filter(Boolean)
    : [cleanName]

  const candidateLines = compactPoiLabelLines(
    wordLines,
    maxWidth,
    MAX_POI_FONT_SIZE,
  )
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
  for (let fontSize = MAX_POI_FONT_SIZE; fontSize >= MIN_POI_FONT_SIZE; fontSize -= 1) {
    const widestLine = Math.max(
      ...lines.map((line) => estimateTextWidth(line, fontSize)),
      0,
    )
    const totalHeight = lines.length * fontSize * POI_LINE_HEIGHT_MULTIPLIER

    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      return fontSize
    }
  }

  return MIN_POI_FONT_SIZE
}

function estimateTextWidth(text, fontSize) {
  return [...String(text ?? '')].reduce((width, character) => {
    if (character === ' ') {
      return width + fontSize * SPACE_WIDTH_FACTOR
    }

    if (CJK_CHARACTER_PATTERN.test(character)) {
      return width + fontSize * CJK_WIDTH_FACTOR
    }

    if (NARROW_CHARACTER_PATTERN.test(character)) {
      return width + fontSize * LATIN_WIDTH_FACTOR
    }

    return width + fontSize * DEFAULT_WIDTH_FACTOR
  }, 0)
}
