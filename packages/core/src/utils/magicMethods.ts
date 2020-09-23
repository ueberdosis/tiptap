export default function magicMethods(Clazz: any) {
  const classHandler = Object.create(null)

  classHandler.construct = (_: any, args: any) => {
    const instance = new Clazz(...args)
    const instanceHandler = Object.create(null)
    const get = Object.getOwnPropertyDescriptor(Clazz.prototype, '__get')

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
        }

        return get.value.call(target, name)
      }
    }

    instance.proxy = new Proxy(instance, instanceHandler)
    instance.emit('createdProxy')

    return instance.proxy
  }

  return new Proxy(Clazz, classHandler)
}
