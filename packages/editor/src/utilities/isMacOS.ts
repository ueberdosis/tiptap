export function isMacOS(): boolean {
  return typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false
}
