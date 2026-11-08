export const attrsEqual = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  if (a === b) {
    return true
  }
  const aKeys = Object.keys(a)
  return aKeys.length === Object.keys(b).length && aKeys.every(k => a[k] === b[k])
}
