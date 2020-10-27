import { AnyObject } from '../types'

export default function mergeAttributes(...object: AnyObject[]) {
  return object.reduce((items, item) => {
    const mergedAttributes = { ...items }

    Object.entries(item).forEach(([key, value]) => {
      if (!mergedAttributes[key]) {
        mergedAttributes[key] = value
        return
      }

      if (key === 'class') {
        mergedAttributes[key] = [mergedAttributes[key], value].join(' ')
        return
      }

      if (key === 'style') {
        mergedAttributes[key] = [mergedAttributes[key], value].join('; ')
      }
    })

    return mergedAttributes
  }, {})
}
