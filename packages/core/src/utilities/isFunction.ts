// oxlint-disable-next-lineno-unsafe-function-type
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}
