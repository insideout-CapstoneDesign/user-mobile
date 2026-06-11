export default function FloorplanVectorLayers({ vectorMap }) {
  return (
    <g>
      <rect
        x="0"
        y="0"
        width={vectorMap.size.width}
        height={vectorMap.size.height}
        fill="#f3f4f6"
      />
      {vectorMap.zones.map((zone) => (
        <path
          key={zone.id}
          d={zone.path}
          fill={zone.fill}
          stroke={zone.stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {vectorMap.objects.map((object) => (
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
      {vectorMap.pois.map((poi) => (
        <PoiLabel key={poi.id} poi={poi} />
      ))}
    </g>
  )
}

function PoiLabel({ poi }) {
  if (poi.icon) {
    const iconSize = poi.iconSize

    return (
      <image
        href={poi.icon}
        x={poi.x - iconSize / 2}
        y={poi.y - iconSize / 2}
        width={iconSize}
        height={iconSize}
        preserveAspectRatio="xMidYMid meet"
      />
    )
  }

  if (!poi.name || poi.lines.length === 0) {
    return null
  }

  const lineHeight = poi.fontSize * 1.18
  const firstDy = -((poi.lines.length - 1) * lineHeight) / 2

  return (
    <text
      x={poi.x}
      y={poi.y}
      fill="#111111"
      fontSize={poi.fontSize}
      fontWeight="750"
      textAnchor="middle"
      dominantBaseline="middle"
      paintOrder="stroke"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinejoin="round"
    >
      {poi.lines.map((line, index) => (
        <tspan
          key={`${poi.id}-line-${index}`}
          x={poi.x}
          dy={index === 0 ? firstDy : lineHeight}
        >
          {line}
        </tspan>
      ))}
    </text>
  )
}
