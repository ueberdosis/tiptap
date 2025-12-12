/** Yields property/value pairs from a style string. */
function parseStyleEntries(styles: string | undefined): [property: string, value: string][] {
  const pairs: [string, string][] = []

  const declarations = (styles || '').split(';')
  const numDeclarations = declarations.length

  for (let i = 0; i < numDeclarations; i += 1) {
    const declaration = declarations[i]

    const firstColonIndex = declaration.indexOf(':')
    if (firstColonIndex === -1) {
      continue
    }

    const property = declaration.slice(0, firstColonIndex).trim()
    const value = declaration.slice(firstColonIndex + 1).trim()
    if (property && value) {
      pairs.push([property, value])
    }
  }

  return pairs
}

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

          const insertClasses = valueClasses.filter(valueClass => !existingClasses.includes(valueClass))

          mergedAttributes[key] = [...existingClasses, ...insertClasses].join(' ')
        } else if (key === 'style') {
          const styleMap = new Map([...parseStyleEntries(mergedAttributes[key]), ...parseStyleEntries(value)])

          mergedAttributes[key] = Array.from(styleMap.entries())
            .map(([property, val]) => `${property}: ${val}`)
            .join('; ')
        } else {
          mergedAttributes[key] = value
        }
      })

      return mergedAttributes
    }, {})
}
