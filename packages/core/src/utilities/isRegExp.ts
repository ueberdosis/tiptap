export default function isRegExp(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}
