/**
 * Turn a string into the value it looks like, so `"12"` becomes `12` and `"true"` becomes `true`.
 * Used when reading attributes out of the DOM.
 */
export function fromString(value: any): any {
  if (typeof value !== 'string') {
    return value
  }

  if (value.match(/^[+-]?(?:\d*\.)?\d+$/)) {
    return Number(value)
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}
