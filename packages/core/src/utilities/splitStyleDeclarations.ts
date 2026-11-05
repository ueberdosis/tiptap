/** Splits a CSS style string into declarations, ignoring semicolons inside quotes/parentheses. */
export function splitStyleDeclarations(styles: string): string[] {
  const result: string[] = []

  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let parenDepth = 0

  const length = styles.length
  for (let i = 0; i < length; i += 1) {
    const char = styles[i]
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      current += char
      continue
    }
    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      current += char
      continue
    }
    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '(') {
        parenDepth += 1
        current += char
        continue
      }
      if (char === ')' && parenDepth > 0) {
        parenDepth -= 1
        current += char
        continue
      }
      if (char === ';' && parenDepth === 0) {
        result.push(current)
        current = ''
        continue
      }
    }
    current += char
  }
  if (current) {
    result.push(current)
  }

  return result
}
