export default function isString(value: any): value is string {
  return typeof value === 'string'
}
