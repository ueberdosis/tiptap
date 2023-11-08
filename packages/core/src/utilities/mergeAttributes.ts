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
          const valueStyles: string[] = value ? value.split(';') : []
          const existingStyles: string[] = mergedAttributes[key] ? mergedAttributes[key].split(';') : []

          const valueStyleProperties = valueStyles.map(valueStyle => valueStyle.split(':'))
          const existingStyleProperties = existingStyles.map(existingStyle => existingStyle.split(':'))

          const existingStyleKeys = existingStyleProperties.map(property => property[0])

          const insertStyleProperties = valueStyleProperties.filter(
            valueStyleProperty => !existingStyleKeys.includes(valueStyleProperty[0]),
          )

          const existingStyleAttributes = existingStyleProperties.map(
            existingStyleProperty => existingStyleProperty.join(':'),
          ).join('; ')

          const insertStyleAttributes = insertStyleProperties.map(
            insertStyleProperty => insertStyleProperty.join(':'),
          ).join('; ')

          mergedAttributes[key] = [existingStyleAttributes, insertStyleAttributes].join('; ')
        } else {
          mergedAttributes[key] = value
        }
      })

      return mergedAttributes
    }, {})
}
