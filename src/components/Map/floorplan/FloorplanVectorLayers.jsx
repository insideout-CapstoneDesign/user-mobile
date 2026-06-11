const DEFAULT_MAP_SIZE = { width: 0, height: 0 }
const DEFAULT_ICON_SIZE = 34
const DEFAULT_FONT_SIZE = 14
const POI_LINE_HEIGHT_MULTIPLIER = 1.18

export default function FloorplanVectorLayers({ vectorMap }) {
  const size = vectorMap?.size ?? DEFAULT_MAP_SIZE
  const width = toPositiveNumber(size.width)
  const height = toPositiveNumber(size.height)
  const zones = Array.isArray(vectorMap?.zones) ? vectorMap.zones : []
  const objects = Array.isArray(vectorMap?.objects) ? vectorMap.objects : []
  const pois = Array.isArray(vectorMap?.pois) ? vectorMap.pois : []

  if (!width || !height) {
    return null
  }

  return (
    <g>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="var(--floorplan-background)"
      />
      {zones.map((zone) => (
        <path
          key={zone.id}
          d={zone.path}
          fill={zone.fill}
          stroke={zone.stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {objects.map((object) => (
        <path
          key={object.id}
          d={object.path}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {pois.map((poi, index) => (
        <PoiLabel key={poi?.id ?? `poi-${index}`} poi={poi} />
      ))}
    </g>
  )
}

function PoiLabel({ poi }) {
  const safePoi = poi && typeof poi === 'object' ? poi : {}

  if (safePoi.icon) {
    const iconSize = toPositiveNumber(safePoi.iconSize) ?? DEFAULT_ICON_SIZE

    return (
      <image
        href={safePoi.icon}
        x={safePoi.x - iconSize / 2}
        y={safePoi.y - iconSize / 2}
        width={iconSize}
        height={iconSize}
        preserveAspectRatio="xMidYMid meet"
      />
    )
  }

  const lines = Array.isArray(safePoi.lines) ? safePoi.lines : []

  if (!safePoi.name || lines.length === 0) {
    return null
  }

  const fontSize = toPositiveNumber(safePoi.fontSize) ?? DEFAULT_FONT_SIZE
  const lineHeight = fontSize * POI_LINE_HEIGHT_MULTIPLIER
  const firstDy = -((lines.length - 1) * lineHeight) / 2

  return (
    <text
      x={safePoi.x}
      y={safePoi.y}
      fill="#111111"
      fontSize={fontSize}
      fontWeight="750"
      textAnchor="middle"
      dominantBaseline="middle"
      paintOrder="stroke"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinejoin="round"
    >
      {lines.map((line, index) => (
        <tspan
          key={`${safePoi.id ?? 'poi'}-line-${index}`}
          x={safePoi.x}
          dy={index === 0 ? firstDy : lineHeight}
        >
          {line}
        </tspan>
      ))}
    </text>
  )
}

function toPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}
