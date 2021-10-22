export default function isNumber(value: any): value is number {
  return typeof value === 'number'
}
