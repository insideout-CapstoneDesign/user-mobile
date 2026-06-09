import { useMemo, useState } from 'react'
import {
  FloorplanBadge,
  FloorplanCanvas,
  FloorplanImage,
  FloorplanRoot,
  FloorplanStage,
  FloorplanState,
  FloorplanSvg,
} from './FloorplanRouteView.styles'

export default function FloorplanRouteView({
  floorplan,
  mapLeg,
  activeStep = null,
  showInstructionBadge = true,
}) {
  const [imageState, setImageState] = useState({
    src: null,
    size: null,
    hasError: false,
  })
  const viewModel = useMemo(
    () => normalizeFloorplanViewModel(floorplan, mapLeg, activeStep),
    [activeStep, floorplan, mapLeg],
  )
  const imageSize =
    imageState.src === viewModel.mapImageUrl && !imageState.hasError
      ? imageState.size
      : null
  const hasImageError =
    imageState.src === viewModel.mapImageUrl && imageState.hasError
  const ratio = imageSize ? imageSize.width / imageSize.height : 1

  if (!viewModel.mapImageUrl) {
    return (
      <FloorplanRoot>
        <FloorplanState>도면을 불러올 수 없습니다.</FloorplanState>
      </FloorplanRoot>
    )
  }

  return (
    <FloorplanRoot>
      <FloorplanStage>
        <FloorplanCanvas $ratio={ratio}>
          <FloorplanImage
            key={viewModel.mapImageUrl}
            src={viewModel.mapImageUrl}
            alt={viewModel.floorName ? `${viewModel.floorName} 도면` : '도면'}
            onLoad={(event) => {
              setImageState({
                src: viewModel.mapImageUrl,
                hasError: false,
                size: {
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                },
              })
            }}
            onError={() =>
              setImageState({
                src: viewModel.mapImageUrl,
                size: null,
                hasError: true,
              })
            }
          />

          {imageSize && viewModel.polylines.length > 0 ? (
            <FloorplanSvg
              viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {viewModel.polylines.map((polyline) => (
                <g key={polyline.id}>
                  <polyline
                    points={polyline.points}
                    fill="none"
                    stroke="rgba(37, 99, 235, 0.24)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={polyline.points}
                    fill="none"
                    stroke="var(--blue-600)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ))}
              {viewModel.activeMarker ? (
                <g>
                  <circle
                    cx={viewModel.activeMarker.x}
                    cy={viewModel.activeMarker.y}
                    r="17"
                    fill="rgba(37, 99, 235, 0.2)"
                  />
                  <circle
                    cx={viewModel.activeMarker.x}
                    cy={viewModel.activeMarker.y}
                    r="9"
                    fill="var(--blue-700)"
                    stroke="var(--surface-0)"
                    strokeWidth="4"
                  />
                </g>
              ) : null}
              {viewModel.markers.map((marker) => (
                <circle
                  key={marker.id}
                  cx={marker.x}
                  cy={marker.y}
                  r={marker.variant === 'endpoint' ? 9 : 5}
                  fill={marker.variant === 'start' ? 'var(--blue-600)' : 'var(--surface-0)'}
                  stroke="var(--blue-600)"
                  strokeWidth="4"
                />
              ))}
            </FloorplanSvg>
          ) : null}
        </FloorplanCanvas>
      </FloorplanStage>

      {showInstructionBadge && viewModel.activeInstruction ? (
        <FloorplanBadge>{viewModel.activeInstruction}</FloorplanBadge>
      ) : null}

      {hasImageError ? (
        <FloorplanState>도면 이미지가 만료되었거나 불러올 수 없습니다.</FloorplanState>
      ) : null}
    </FloorplanRoot>
  )
}

function normalizeFloorplanViewModel(floorplan, mapLeg, activeStep) {
  if (floorplan) {
    const mapLegs = Array.isArray(floorplan.mapLegs) ? floorplan.mapLegs : []
    const activeMarker = findActiveMarker(mapLegs, activeStep)

    return {
      mapImageUrl: floorplan.mapImageUrl,
      floorName: floorplan.name,
      polylines: mapLegs
        .map((leg, index) => ({
          id: leg.id ?? `${floorplan.key}-path-${index}`,
          points: toPolylinePoints(leg.path),
        }))
        .filter((polyline) => polyline.points),
      markers: mapLegs.flatMap((leg, legIndex) =>
        toMarkers(leg.path, `${floorplan.key}-${legIndex}`),
      ),
      activeMarker,
      activeInstruction:
        activeStep?.instruction ?? floorplan.steps?.[0]?.instruction ?? null,
    }
  }

  const activeMarker = findActiveMarker(mapLeg ? [mapLeg] : [], activeStep)

  return {
    mapImageUrl: mapLeg?.mapImageUrl,
    floorName: mapLeg?.floorName,
    polylines: [
      {
        id: mapLeg?.id ?? 'path',
        points: toPolylinePoints(mapLeg?.path),
      },
    ].filter((polyline) => polyline.points),
    markers: toMarkers(mapLeg?.path, mapLeg?.id ?? 'path'),
    activeMarker,
    activeInstruction: activeStep?.instruction ?? mapLeg?.steps?.[0]?.instruction ?? null,
  }
}

function findActiveMarker(mapLegs, activeStep) {
  if (!activeStep) {
    return null
  }

  const leg = mapLegs.find((item) =>
    [item?.id, item?.segmentId, item?.mapLegId]
      .filter(Boolean)
      .includes(activeStep.segmentId ?? activeStep.mapLegId),
  )

  if (!leg) {
    return null
  }

  if (!Array.isArray(leg.path) || leg.path.length === 0) {
    return null
  }

  const startIndex = Number.isInteger(activeStep.pathStartIndex)
    ? activeStep.pathStartIndex
    : activeStep.pathIndex
  const point = leg.path[Math.max(Math.min(startIndex ?? 0, leg.path.length - 1), 0)]

  if (!isValidMapPoint(point)) {
    return null
  }

  return {
    id: `${activeStep.id ?? leg.id}-active-marker`,
    x: point.x,
    y: point.y,
  }
}

function toPolylinePoints(path) {
  if (!Array.isArray(path) || path.length < 2) {
    return null
  }

  const points = path.filter(isValidMapPoint)

  if (points.length < 2) {
    return null
  }

  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

function toMarkers(path, keyPrefix) {
  if (!Array.isArray(path) || path.length === 0) {
    return []
  }

  return path
    .filter(isValidMapPoint)
    .map((point, index, points) => ({
      id: `${keyPrefix}-marker-${index}`,
      x: point.x,
      y: point.y,
      variant:
        index === 0 ? 'start' : index === points.length - 1 ? 'endpoint' : 'waypoint',
    }))
}

function isValidMapPoint(point) {
  return typeof point?.x === 'number' && typeof point?.y === 'number'
}
