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
          const newStyles: string[] = value ? value.split(';') : []
          const existingStyles: string[] = mergedAttributes[key] ? mergedAttributes[key].split(';') : []

          const newStyleProperties = newStyles.map(newStyle => newStyle.split(':'))
          const existingStyleProperties = existingStyles.map(existingStyle => existingStyle.split(':'))

          const newStyleKeys = newStyleProperties.map(property => property[0])

          const updatedExistingStyleProperties = existingStyleProperties.filter(
            existingStyleProperty => !newStyleKeys.includes(existingStyleProperty[0]),
          )

          const existingStyleAttributes = updatedExistingStyleProperties.map(
            updatedExistingStyleProperty => updatedExistingStyleProperty.join(':'),
          ).join('; ')

          const newStyleAttributes = newStyleProperties.map(
            valueStyleProperty => valueStyleProperty.join(':'),
          ).join('; ')

          const mergedStyleAttributes = [existingStyleAttributes, newStyleAttributes].filter(attribute => !!attribute)

          mergedAttributes[key] = mergedStyleAttributes.join('; ')
        } else {
          mergedAttributes[key] = value
        }
      })

      return mergedAttributes
    }, {})
}
