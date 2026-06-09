import { IndoorSuffix } from './DurationWithIndoorSuffix.styles'

export default function DurationWithIndoorSuffix({ value }) {
  const text = String(value ?? '')
  const marker = '+실내이동'
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
