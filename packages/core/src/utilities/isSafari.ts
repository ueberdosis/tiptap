export function isSafari(): boolean {
  return typeof navigator !== 'undefined' ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false
}
