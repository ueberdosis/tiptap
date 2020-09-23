export default function getAllMethodNames(obj: Object) {
  const methods = new Set()

  while (obj = Reflect.getPrototypeOf(obj)) {
    const keys = Reflect.ownKeys(obj)
    keys.forEach(k => methods.add(k))
  }

  return Array.from(methods)
}
