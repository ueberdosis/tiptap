export default function getAllMethodNames(obj: Object): string[] {
  return Reflect.ownKeys(Reflect.getPrototypeOf(obj))
    .map(name => name.toString())
}
