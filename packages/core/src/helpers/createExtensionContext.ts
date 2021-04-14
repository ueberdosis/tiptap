import { AnyExtension, AnyObject } from '../types'

// export default function createExtensionContext<T>(
//   extension: AnyExtension,
//   data: T,
// ): T & { parentConfig: AnyObject } {
//   const context: any = {
//     ...data,
//     // get parentConfig() {
//     //   return Object.fromEntries(Object.entries(extension.parentConfig).map(([key, value]) => {
//     //     if (typeof value !== 'function') {
//     //       return [key, value]
//     //     }

//     //     console.log('call', key)

//     //     return [key, value.bind(context)]
//     //   }))
//     // },

//     parentConfig: Object.fromEntries(Object.entries(extension.parent.config).map(([key, value]) => {
//       if (typeof value !== 'function') {
//         return [key, value]
//       }

//       // console.log('call', key)

//       return [key, value.bind(data)]
//     })),

//     // get parentConfig() {
//     //   console.log('parent', extension.parent)
//     //   console.log('parent parent', extension.parent?.parent)

//     //   return Object.fromEntries(Object.entries(extension.parent.config).map(([key, value]) => {
//     //     if (typeof value !== 'function') {
//     //       return [key, value]
//     //     }

//     //     // console.log('call', key)

//     //     return [key, value.bind(context)]
//     //   }))
//     // },

//     // parentConfig: null,
//   }

//   return context
// }

// export default function createExtensionContext<T>(
//   extension: AnyExtension,
//   data: T,
//   // @ts-ignore
// ): T & { parentConfig: AnyObject } {
//   const context: any = data

//   if (!extension.parent) {
//     context.parentConfig = {}

//     return context
//   }

//   // const bla = {
//   //   ...(extension.parent.parent ? extension.parent.parent.config : {}),
//   //   ...extension.parent.config,
//   // }

//   context.parentConfig = Object.fromEntries(Object.entries(extension.parent.config).map(([key, value]) => {
//     if (typeof value !== 'function') {
//       return [key, value]
//     }

//     // console.log('call', key)

//     return [key, value.bind(createExtensionContext(extension.parent, data))]
//   }))

//   return context
// }

export default function createExtensionContext<T>(
  extension: AnyExtension,
  data: T,
): T & { parentConfig: AnyObject } {
  const context: any = {
    ...data,
    get parentConfig() {
      return Object.fromEntries(Object.entries(extension.parent.config).map(([key, value]) => {
        if (typeof value !== 'function') {
          return [key, value]
        }

        return [key, value.bind(context)]
      }))
    },
  }

  return context
}
