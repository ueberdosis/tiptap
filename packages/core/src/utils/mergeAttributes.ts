import { AnyObject } from '../types'

export default function mergeAttributes(...object: AnyObject[]) {
  return object.reduce((items, item) => {
    const mergedAttributes = { ...items }

    Object.entries(item).forEach(([key, value]) => {
      const exists = mergedAttributes[key]

      if (!exists) {
        mergedAttributes[key] = value
        return
      }

      if (key === 'class') {
        mergedAttributes[key] = [mergedAttributes[key], value].join(' ')
      } else if (key === 'style') {
        mergedAttributes[key] = [mergedAttributes[key], value].join('; ')
      } else {
        mergedAttributes[key] = value
      }
    })

    return mergedAttributes
  }, {})
}
