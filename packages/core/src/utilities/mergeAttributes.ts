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
          const valueClasses: string[] = value ? String(value).split(' ') : []
          const existingClasses: string[] = mergedAttributes[key] ? mergedAttributes[key].split(' ') : []

          const insertClasses = valueClasses.filter(
            valueClass => !existingClasses.includes(valueClass),
          )

          mergedAttributes[key] = [...existingClasses, ...insertClasses].join(' ')
        } else if (key === 'style') {
          const newStyles: string[] = value ? value.split(';').map((style: string) => style.trim()).filter(Boolean) : []
          const existingStyles: string[] = mergedAttributes[key] ? mergedAttributes[key].split(';').map((style: string) => style.trim()).filter(Boolean) : []

          const styleMap = new Map<string, string>()

          existingStyles.forEach(style => {
            const [property, val] = style.split(':').map(part => part.trim())

            styleMap.set(property, val)
          })

          newStyles.forEach(style => {
            const [property, val] = style.split(':').map(part => part.trim())

            styleMap.set(property, val)
          })

          mergedAttributes[key] = Array.from(styleMap.entries()).map(([property, val]) => `${property}: ${val}`).join('; ')
        } else {
          mergedAttributes[key] = value
        }
      })

      return mergedAttributes
    }, {})
}
