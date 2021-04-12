import { AnyExtension, AnyObject } from '../types'

export default function createExtensionContext<T>(
  extension: AnyExtension,
  data: T,
): T & { parentConfig: AnyObject } {
  const context = {
    ...data,
    get parentConfig() {
      return Object.fromEntries(Object.entries(extension.parentConfig).map(([key, value]) => {
        if (typeof value !== 'function') {
          return [key, value]
        }

        return [key, value.bind(context)]
      }))
    },
  }

  return context
}
