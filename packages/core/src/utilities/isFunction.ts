// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}
