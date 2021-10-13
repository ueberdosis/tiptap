export default function isObject(value: any): value is Function {
  return typeof value === 'function'
}
