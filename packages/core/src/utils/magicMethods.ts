export default function magicMethods(clazz: any) {
  const classHandler = Object.create(null)

  classHandler.construct = (target: any, args: any) => {
    const instance = new clazz(...args)
    const instanceHandler = Object.create(null)
    const get = Object.getOwnPropertyDescriptor(clazz.prototype, '__get')

    if (get) {
      instanceHandler.get = (target: any, name: any) => {
        if (typeof name !== 'string') {
          return
        }

        const exists = name in target
          || name.startsWith('_')
          || ['then', 'catch'].includes(name)

        if (exists) {
          return target[name]
        } else {
          return get.value.call(target, name)
        }
      }
    }

    instance.proxy = new Proxy(instance, instanceHandler)

    return instance.proxy
  }

  return new Proxy(clazz, classHandler)
}