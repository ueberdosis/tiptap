// export default function magicMethods (clazz) {
//   const classHandler = Object.create(null)

//   // Trap for class instantiation
//   classHandler.construct = (target, args) => {
//     // Wrapped class instance
//     const instance = new clazz(...args)
//     // Instance traps
//     const instanceHandler = Object.create(null)

//     const get = Object.getOwnPropertyDescriptor(clazz.prototype, 'command')
//     if (get) {
//       instanceHandler.get = (target, name) => {
//         const exists = name in target
        
//         if (exists) {
//           return target[name]
//         } else {
//           return get.value.call(target, name)
//         }
//       }
//     }

//     return new Proxy(instance, instanceHandler)
//   }

//   return new Proxy(clazz, classHandler)
// }

// export default function magicMethods (clazz) {
//   const classHandler = Object.create(null)

//   // Trap for class instantiation
//   classHandler.construct = (target, args) => {
//     // Wrapped class instance
//     const instance = new clazz(...args)
//     // Instance traps
//     const instanceHandler = Object.create(null)

//     const get = Object.getOwnPropertyDescriptor(clazz.prototype, 'command')
//     if (get) {
//       instanceHandler.get = (target, name) => {
//         const exists = name in target
        
//         if (exists) {
//           return target[name]
//         } else {
//           return get.value.call(target, name)
//         }
//       }
//     }

//     // return new Proxy(instance, instanceHandler)
//     const proxy = new Proxy(instance, instanceHandler)
//     instance.proxy = proxy

//     return proxy
//   }

//   return new Proxy(clazz, classHandler)
// }


export default function magicMethods (clazz) {
  const classHandler = Object.create(null)

  classHandler.construct = (target, args) => {
    const instance = new clazz(...args)
    const instanceHandler = Object.create(null)
    const get = Object.getOwnPropertyDescriptor(clazz.prototype, '__get')

    if (get) {
      instanceHandler.get = (target, name) => {
        if (typeof name !== 'string') {
          return
        }

        const exists = name in target || name.startsWith('_')
        
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