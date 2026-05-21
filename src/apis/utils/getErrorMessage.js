import { ERROR_MESSAGE } from '../../constants/errorMessages'

export default function getErrorMessage({
  status,
  code,
  message,
  fallbackMessage = ERROR_MESSAGE.DEFAULT,
  statusMap = {},
  codeMap = {},
  exposeRawMessage = false,
}) {
  if (code && codeMap[code]) return codeMap[code]
  if (typeof status === 'number' && statusMap[status]) return statusMap[status]
  if (exposeRawMessage && message) return message
  return fallbackMessage
}
