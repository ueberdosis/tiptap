export default function isEmptyObject(object = {}): boolean {
  return Object.keys(object).length === 0 && object.constructor === Object
}
