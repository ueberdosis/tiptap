export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' ? /android/i.test(navigator.userAgent) : false
}
