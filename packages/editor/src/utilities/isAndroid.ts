export function isAndroid(): boolean {
  return ['Android'].includes(navigator.platform) || /android/i.test(navigator.userAgent)
}
