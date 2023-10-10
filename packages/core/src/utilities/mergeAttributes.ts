export function mergeAttributes(...objects: Record<string, any>[]): Record<string, any> {
  return objects
    .filter(item => !!item)
    .reduce((items, item) => {
      const mergedAttributes = { ...items }

      Object.entries(item).forEach(([key, value]) => {
        const exists = mergedAttributes[key]

        if (!exists) {
          mergedAttributes[key] = value

          return
        }

        if (key === 'class') {
          const valueClasses: string[] = value ? value.split(' ') : []
          const existingClasses: string[] = mergedAttributes[key] ? mergedAttributes[key].split(' ') : []

          const insertClasses = valueClasses.filter(
            valueClass => !existingClasses.includes(valueClass),
          )

          mergedAttributes[key] = [...existingClasses, ...insertClasses].join(' ')
        } else if (key === 'style') {
          mergedAttributes[key] = [mergedAttributes[key], value].join('; ')
        } else {
          mergedAttributes[key] = value
        }
      })

      return mergedAttributes
    }, {})
}
