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

    // A CSS escape consumes the next character, whatever it is. Escaped quotes
    // must not close a string and escaped parentheses must not change the depth.
    if (char === '\\' && i + 1 < length) {
      current += char + styles[i + 1]
      i += 1
      continue
    }

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
      // Copy CSS comments as plain text so quotes and semicolons inside them
      // do not change the scanner state.
      if (char === '/' && styles[i + 1] === '*') {
        const commentEnd = styles.indexOf('*/', i + 2)
        const end = commentEnd === -1 ? length : commentEnd + 2

        current += styles.slice(i, end)
        i = end - 1
        continue
      }

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
