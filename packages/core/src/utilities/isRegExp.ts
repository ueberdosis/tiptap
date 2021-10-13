export default function isRegExp(value: any): value is RegExp {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}
