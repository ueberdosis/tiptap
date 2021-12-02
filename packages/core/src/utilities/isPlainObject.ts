// see: https://github.com/mesqueeb/is-what/blob/88d6e4ca92fb2baab6003c54e02eedf4e729e5ab/src/index.ts

function getType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1)
}

export default function isPlainObject(value: any): value is Record<string, any> {
  if (getType(value) !== 'Object') {
    return false
  }

  return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype
}
