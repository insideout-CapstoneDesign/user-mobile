export function geoJsonToPath(geometry) {
  const type = getGeometryType(geometry)

  if (type === 'Polygon') {
    return polygonToPath(geometry.coordinates)
  }

  if (type === 'LineString') {
    return lineStringToPath(geometry.coordinates)
  }

  return null
}

export function geoJsonToPoint(geometry) {
  if (getGeometryType(geometry) !== 'Point') {
    return null
  }

  return coordinateToPoint(geometry.coordinates)
}

export function getGeometryBounds(geometry) {
  const points = getGeometryPoints(geometry)
  if (points.length === 0) {
    return null
  }

  const bounds = points.reduce(
    (currentBounds, point) => ({
      minX: Math.min(currentBounds.minX, point.x),
      minY: Math.min(currentBounds.minY, point.y),
      maxX: Math.max(currentBounds.maxX, point.x),
      maxY: Math.max(currentBounds.maxY, point.y),
    }),
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  )

  return {
    ...bounds,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    center: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    },
  }
}

export function getPointBounds(points) {
  const validPoints = Array.isArray(points) ? points.filter(isValidMapPoint) : []
  if (validPoints.length === 0) {
    return null
  }

  return validPoints.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: validPoints[0].x,
      minY: validPoints[0].y,
      maxX: validPoints[0].x,
      maxY: validPoints[0].y,
    },
  )
}

export function getBoundsCenter(bounds) {
  if (!bounds) {
    return null
  }

  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  }
}

export function toValidMapPoints(path) {
  return Array.isArray(path) ? path.filter(isValidMapPoint) : []
}

export function isValidMapPoint(point) {
  return typeof point?.x === 'number' && typeof point?.y === 'number'
}

export function getSquaredDistance(pointA, pointB) {
  const dx = pointA.x - pointB.x
  const dy = pointA.y - pointB.y
  return dx * dx + dy * dy
}

export function getGeometryType(geometry) {
  return String(geometry?.type ?? '')
}

export function toPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function polygonToPath(rings) {
  if (!Array.isArray(rings)) {
    return null
  }

  const path = rings
    .map((ring) => {
      const points = coordinatesToPoints(ring)
      if (points.length < 3) return null
      const [firstPoint, ...restPoints] = points
      return [
        `M ${firstPoint.x} ${firstPoint.y}`,
        ...restPoints.map((point) => `L ${point.x} ${point.y}`),
        'Z',
      ].join(' ')
    })
    .filter(Boolean)
    .join(' ')

  return path || null
}

function lineStringToPath(coordinates) {
  const points = coordinatesToPoints(coordinates)
  if (points.length < 2) {
    return null
  }

  const [firstPoint, ...restPoints] = points
  return [
    `M ${firstPoint.x} ${firstPoint.y}`,
    ...restPoints.map((point) => `L ${point.x} ${point.y}`),
  ].join(' ')
}

function getGeometryPoints(geometry) {
  const type = getGeometryType(geometry)

  if (type === 'Point') {
    const point = geoJsonToPoint(geometry)
    return point ? [point] : []
  }

  if (type === 'LineString') {
    return coordinatesToPoints(geometry.coordinates)
  }

  if (type === 'Polygon' && Array.isArray(geometry?.coordinates)) {
    return geometry.coordinates.flatMap(coordinatesToPoints)
  }

  return []
}

function coordinatesToPoints(coordinates) {
  if (!Array.isArray(coordinates)) {
    return []
  }

  return coordinates.map(coordinateToPoint).filter(Boolean)
}

function coordinateToPoint(coordinate) {
  if (!Array.isArray(coordinate) || coordinate.length < 2) {
    return null
  }

  const x = Number(coordinate[0])
  const y = Number(coordinate[1])

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return { x, y }
}
