import { IndoorSuffix } from './DurationWithIndoorSuffix.styles'

export default function DurationWithIndoorSuffix({ value }) {
  const text = String(value ?? '')
  const marker = '+실내이동'
  const prefixMarker = '실내이동+'
  const prefixMarkerIndex = text.indexOf(prefixMarker)

  if (prefixMarkerIndex === 0) {
    const mainText = text.slice(prefixMarker.length).trimStart()

    return (
      <>
        <IndoorSuffix $position="prefix">{prefixMarker}</IndoorSuffix>
        {mainText}
      </>
    )
  }

  const markerIndex = text.indexOf(marker)

  if (markerIndex < 0) {
    return text
  }

  const mainText = text.slice(0, markerIndex).trimEnd()

  return (
    <>
      {mainText}
      <IndoorSuffix>{marker}</IndoorSuffix>
    </>
  )
}
