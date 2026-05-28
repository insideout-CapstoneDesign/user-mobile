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

export default function FloorplanRouteView({ floorplan, mapLeg }) {
  const [imageState, setImageState] = useState({
    src: null,
    size: null,
    hasError: false,
  })
  const viewModel = useMemo(
    () => normalizeFloorplanViewModel(floorplan, mapLeg),
    [floorplan, mapLeg],
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

      {viewModel.activeInstruction ? (
        <FloorplanBadge>{viewModel.activeInstruction}</FloorplanBadge>
      ) : null}

      {hasImageError ? (
        <FloorplanState>도면 이미지가 만료되었거나 불러올 수 없습니다.</FloorplanState>
      ) : null}
    </FloorplanRoot>
  )
}

function normalizeFloorplanViewModel(floorplan, mapLeg) {
  if (floorplan) {
    return {
      mapImageUrl: floorplan.mapImageUrl,
      floorName: floorplan.name,
      polylines: floorplan.mapLegs
        .map((leg, index) => ({
          id: leg.id ?? `${floorplan.key}-path-${index}`,
          points: toPolylinePoints(leg.path),
        }))
        .filter((polyline) => polyline.points),
      markers: floorplan.mapLegs.flatMap((leg, legIndex) =>
        toMarkers(leg.path, `${floorplan.key}-${legIndex}`),
      ),
      activeInstruction: floorplan.steps?.[0]?.instruction ?? null,
    }
  }

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
    activeInstruction: mapLeg?.steps?.[0]?.instruction ?? null,
  }
}

function toPolylinePoints(path) {
  if (!Array.isArray(path) || path.length < 2) {
    return null
  }

  return path
    .filter((point) => typeof point.x === 'number' && typeof point.y === 'number')
    .map((point) => `${point.x},${point.y}`)
    .join(' ')
}

function toMarkers(path, keyPrefix) {
  if (!Array.isArray(path) || path.length === 0) {
    return []
  }

  return path
    .filter((point) => typeof point.x === 'number' && typeof point.y === 'number')
    .map((point, index, points) => ({
      id: `${keyPrefix}-marker-${index}`,
      x: point.x,
      y: point.y,
      variant:
        index === 0 ? 'start' : index === points.length - 1 ? 'endpoint' : 'waypoint',
    }))
}
