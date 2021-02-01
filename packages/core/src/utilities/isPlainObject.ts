// see: https://github.com/mesqueeb/is-what/blob/88d6e4ca92fb2baab6003c54e02eedf4e729e5ab/src/index.ts

function getType(payload: any): string {
  return Object.prototype.toString.call(payload).slice(8, -1)
}

export default function isPlainObject(payload: any): payload is Record<string, any> {
  if (getType(payload) !== 'Object') return false
  return payload.constructor === Object && Object.getPrototypeOf(payload) === Object.prototype
}
