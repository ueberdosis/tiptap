export default function isEmptyObject(value = {}): boolean {
  return Object.keys(value).length === 0 && value.constructor === Object
}
