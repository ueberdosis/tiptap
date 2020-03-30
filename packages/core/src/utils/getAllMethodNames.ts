export default function getAllMethodNames(obj: Object) {
  let methods = new Set()

  while (obj = Reflect.getPrototypeOf(obj)) {
    let keys = Reflect.ownKeys(obj)
    keys.forEach((k) => methods.add(k))
  }

  return Array.from(methods)
}