import { AnyObject } from '../types'

export default function mergeAttributes(attributes1: AnyObject, attributes2: AnyObject) {
  const mergedAttributes = { ...attributes1 }

  Object.entries(attributes2).forEach(([key, value]) => {
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
}
