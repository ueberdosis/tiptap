export function parseInlineStyles(styleString: string): Map<string, string> {
  const styles = new Map<string, string>()

  if (!styleString.trim()) {
    return styles
  }

  const declarations = styleString.split(';')

  for (let i = 0; i < declarations.length; i += 1) {
    const declaration = declarations[i]

    if (!declaration.trim()) {
      continue
    }

    const colonIndex = declaration.indexOf(':')

    if (colonIndex === -1) {
      continue
    }

    const property = declaration.substring(0, colonIndex).trim()
    const value = declaration.substring(colonIndex + 1).trim()

    if (property && value) {
      styles.set(property.toLowerCase(), value)
    }
  }

  return styles
}
