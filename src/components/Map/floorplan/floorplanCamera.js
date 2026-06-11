import {
  clamp,
  getBoundsCenter,
  getPointBounds,
} from './floorplanGeometry'

export const MAX_SCALE = 5

const MIN_SCALE_FALLBACK = 0.35
const ROUTE_FIT_PADDING = 0.9
const DEFAULT_ROUTE_ZOOM = 3.2
const EDGE_OVERSCROLL_RATIO = 0.85

export function resolveBaseCamera(viewModel, imageSize, stageSize, preferredScale = null) {
  const containScale = Math.min(
    stageSize.width / imageSize.width,
    stageSize.height / imageSize.height,
  )
  const routeBounds = getPointBounds(viewModel.routePoints)
  const routeScale = routeBounds
    ? resolveRouteFitScale(routeBounds, stageSize)
    : containScale
  const routeZoomScale = Math.max(
    containScale,
    Math.min(routeScale, containScale * DEFAULT_ROUTE_ZOOM),
  )
  const scale = clamp(
    preferredScale ?? routeZoomScale,
    getMinScale(imageSize, stageSize),
    MAX_SCALE,
  )
  const center = getBoundsCenter(routeBounds) ?? {
    x: imageSize.width / 2,
    y: imageSize.height / 2,
  }

  return clampCamera(centerCamera(center, scale, stageSize), imageSize, stageSize)
}

export function resolveActiveCamera({
  activePoint,
  baseCamera,
  camera,
  imageSize,
  stageSize,
  userMovedCamera,
}) {
  if (!activePoint) {
    return userMovedCamera ? null : baseCamera
  }

  const scale = camera?.scale ?? baseCamera.scale
  return clampCamera(centerCamera(activePoint, scale, stageSize), imageSize, stageSize)
}

export function getMinScale(imageSize, stageSize) {
  if (!imageSize || !stageSize) {
    return MIN_SCALE_FALLBACK
  }

  return Math.min(
    stageSize.width / imageSize.width,
    stageSize.height / imageSize.height,
  )
}

export function clampCamera(camera, imageSize, stageSize) {
  const scaledWidth = imageSize.width * camera.scale
  const scaledHeight = imageSize.height * camera.scale

  return {
    scale: camera.scale,
    x: clampTranslation(camera.x, scaledWidth, stageSize.width),
    y: clampTranslation(camera.y, scaledHeight, stageSize.height),
  }
}

export function screenToImagePoint(point, camera) {
  return {
    x: (point.x - camera.x) / camera.scale,
    y: (point.y - camera.y) / camera.scale,
  }
}

export function scheduleCameraUpdate(nextCamera, setCamera, pendingCameraRef, frameRef) {
  pendingCameraRef.current = nextCamera

  if (frameRef.current) {
    return
  }

  frameRef.current = requestAnimationFrame(() => {
    frameRef.current = null
    if (pendingCameraRef.current) {
      setCamera(pendingCameraRef.current)
      pendingCameraRef.current = null
    }
  })
}

export function getPointerPair(pointerMap) {
  return [...pointerMap.values()].slice(0, 2)
}

export function getPointerCenter(pointers) {
  return {
    x: (pointers[0].x + pointers[1].x) / 2,
    y: (pointers[0].y + pointers[1].y) / 2,
  }
}

export function getPointerDistance(pointers) {
  const dx = pointers[0].x - pointers[1].x
  const dy = pointers[0].y - pointers[1].y
  return Math.sqrt(dx * dx + dy * dy)
}

export function animateCamera(setCamera, targetCamera) {
  let frameId = null
  const durationMs = 220

  setCamera((currentCamera) => {
    if (!currentCamera) {
      return targetCamera
    }

    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / durationMs, 1)
      const eased = easeOutCubic(progress)

      setCamera({
        x: interpolate(currentCamera.x, targetCamera.x, eased),
        y: interpolate(currentCamera.y, targetCamera.y, eased),
        scale: interpolate(currentCamera.scale, targetCamera.scale, eased),
      })

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return currentCamera
  })

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }
  }
}

function resolveRouteFitScale(bounds, stageSize) {
  const routeWidth = Math.max(bounds.maxX - bounds.minX, 1)
  const routeHeight = Math.max(bounds.maxY - bounds.minY, 1)

  return Math.min(
    stageSize.width / (routeWidth * ROUTE_FIT_PADDING),
    stageSize.height / (routeHeight * ROUTE_FIT_PADDING),
  )
}

function centerCamera(point, scale, stageSize) {
  return {
    scale,
    x: stageSize.width / 2 - point.x * scale,
    y: stageSize.height / 2 - point.y * scale,
  }
}

function clampTranslation(value, scaledSize, viewportSize) {
  const edgeCenterPadding = viewportSize * EDGE_OVERSCROLL_RATIO

  return clamp(
    value,
    viewportSize - edgeCenterPadding - scaledSize,
    edgeCenterPadding,
  )
}

function interpolate(from, to, progress) {
  return from + (to - from) * progress
}

function easeOutCubic(value) {
  return 1 - ((1 - value) ** 3)
}
