export default function isEmptyObject(object = {}) {
  return Object.keys(object).length === 0 && object.constructor === Object
}
