export function isAndroid(): boolean {
  return navigator.platform === 'Android' || /android/i.test(navigator.userAgent)
}
