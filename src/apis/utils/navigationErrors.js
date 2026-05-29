export function isNavigationNotFoundCode(code) {
  return typeof code === 'string' && code.startsWith('NAVIGATION404_')
}
