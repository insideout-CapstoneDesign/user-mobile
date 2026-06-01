import { useCallback, useMemo, useRef, useState } from 'react'
import {
  buildNavigationRequest,
  findNavigationRoutes,
} from '../apis/navigationApi'

const EMPTY_ARRAY = []

export default function useNavigationRoute({
  initialData = null,
  initialSelectedRouteOptionId = null,
} = {}) {
  const requestSequenceRef = useRef(0)
  const [status, setStatus] = useState(() => (initialData ? 'success' : 'idle'))
  const [error, setError] = useState(null)
  const [data, setData] = useState(initialData)
  const [selectedRouteOptionId, setSelectedRouteOptionId] = useState(() => {
    const initialRouteOptions = initialData?.routeOptions ?? EMPTY_ARRAY
    return (
      initialSelectedRouteOptionId ??
      initialRouteOptions.find((option) => option.active)?.id ??
      initialRouteOptions[0]?.id ??
      null
    )
  })
  const [selectedFloorplanKey, setSelectedFloorplanKey] = useState(null)

  const routeOptions = data?.routeOptions ?? EMPTY_ARRAY
  const selectedRouteOption = useMemo(
    () =>
      routeOptions.find((option) => option.id === selectedRouteOptionId) ??
      routeOptions[0] ??
      null,
    [routeOptions, selectedRouteOptionId],
  )

  const selectedRouteMapLegs = selectedRouteOption?.mapLegs ?? EMPTY_ARRAY
  const floorplans = useMemo(
    () => collectFloorplans(selectedRouteMapLegs),
    [selectedRouteMapLegs],
  )
  const selectedFloorplan = useMemo(
    () =>
      floorplans.find((floorplan) => floorplan.key === selectedFloorplanKey) ??
      floorplans[0] ??
      null,
    [floorplans, selectedFloorplanKey],
  )
  const activeMapLeg = selectedFloorplan?.mapLegs?.[0] ?? null
  const activeFloorKey = selectedFloorplan?.key ?? null
  const turnByTurnSteps = selectedRouteOption?.turnByTurnSteps ?? EMPTY_ARRAY
  const activeFloorSteps = selectedFloorplan?.steps ?? EMPTY_ARRAY
  const hasNavigationNotFound =
    data?.hasNavigationNotFoundFailure || error?.isNavigationNotFound || false

  const requestRoute = useCallback(async (requestInput) => {
    const requestSequence = startRequest(requestSequenceRef)

    setStatus('loading')
    setError(null)

    try {
      const request = buildNavigationRequest(requestInput)
      const nextData = await findNavigationRoutes(request)

      if (!isLatestRequest(requestSequenceRef, requestSequence)) {
        return null
      }

      const firstOption = nextData.routeOptions[0] ?? null
      const firstFloorplan = collectFloorplans(firstOption?.mapLegs ?? EMPTY_ARRAY)[0] ?? null

      setData(nextData)
      setSelectedRouteOptionId(firstOption?.id ?? null)
      setSelectedFloorplanKey(firstFloorplan?.key ?? null)
      setStatus('success')

      return nextData
    } catch (nextError) {
      if (!isLatestRequest(requestSequenceRef, requestSequence)) {
        return null
      }

      setData(null)
      setSelectedRouteOptionId(null)
      setSelectedFloorplanKey(null)
      setError(nextError)
      setStatus('error')
      throw nextError
    }
  }, [])

  const selectRouteOption = useCallback((optionOrId) => {
    const nextOptionId =
      typeof optionOrId === 'string' ? optionOrId : optionOrId?.id ?? null
    const nextOption =
      routeOptions.find((option) => option.id === nextOptionId) ??
      routeOptions[0] ??
      null
    const nextFloorplan = collectFloorplans(nextOption?.mapLegs ?? EMPTY_ARRAY)[0] ?? null

    setSelectedRouteOptionId(nextOption?.id ?? nextOptionId)
    setSelectedFloorplanKey(nextFloorplan?.key ?? null)
  }, [routeOptions])

  const selectFloorplan = useCallback((floorplanOrKey) => {
    const key =
      typeof floorplanOrKey === 'string'
        ? floorplanOrKey
        : floorplanOrKey?.key ?? floorplanOrKey?.id ?? floorplanOrKey?.name
    const floorplan =
      floorplans.find((item) => item.key === key) ??
      floorplans.find((item) => item.id === key) ??
      floorplans.find((item) => item.name === key)

    setSelectedFloorplanKey(floorplan?.key ?? null)
  }, [floorplans])

  const resetRoute = useCallback(() => {
    requestSequenceRef.current += 1
    setStatus('idle')
    setError(null)
    setData(null)
    setSelectedRouteOptionId(null)
    setSelectedFloorplanKey(null)
  }, [])

  return {
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    data,
    routeOptions,
    selectedRouteOption,
    selectedRouteOptionId: selectedRouteOption?.id ?? null,
    mapLegs: selectedRouteMapLegs,
    mapFloors: floorplans,
    floorplans,
    activeFloorKey,
    activeMapLeg,
    selectedFloorplan,
    selectedFloorplanKey: selectedFloorplan?.key ?? null,
    turnByTurnSteps,
    activeFloorSteps,
    failures: data?.failures ?? EMPTY_ARRAY,
    hasNavigationNotFound,
    requestRoute,
    selectRouteOption,
    selectFloor: selectFloorplan,
    selectFloorplan,
    resetRoute,
  }
}

function collectFloorplans(mapLegs) {
  const floorplanMap = new Map()

  mapLegs.forEach((leg) => {
    if (!leg || typeof leg !== 'object') {
      return
    }

    const key = getMapFloorKey(leg)
    const current = floorplanMap.get(key)
    const nextLegs = [...(current?.mapLegs ?? []), leg]
    const steps = nextLegs.flatMap((item) => item.steps ?? [])

    floorplanMap.set(key, {
      key,
      id: current?.id ?? leg.floorId,
      name: current?.name ?? leg.floorName ?? leg.mapType ?? '지도',
      label: current?.label ?? leg.floorName ?? leg.mapType ?? '지도',
      mapType: current?.mapType ?? leg.mapType,
      mapImageUrl: current?.mapImageUrl ?? leg.mapImageUrl,
      coordinateType: current?.coordinateType ?? leg.coordinateType,
      mapLegs: nextLegs,
      paths: nextLegs.map((item) => item.path).filter((path) => path?.length),
      steps,
    })
  })

  return [...floorplanMap.values()]
}

function startRequest(requestSequenceRef) {
  const requestSequence = requestSequenceRef.current + 1
  requestSequenceRef.current = requestSequence
  return requestSequence
}

function isLatestRequest(requestSequenceRef, requestSequence) {
  return requestSequence === requestSequenceRef.current
}

function getMapFloorKey(mapLeg) {
  return mapLeg?.floorId ?? `${mapLeg?.mapType ?? 'MAP'}-${mapLeg?.floorName ?? 'default'}`
}
