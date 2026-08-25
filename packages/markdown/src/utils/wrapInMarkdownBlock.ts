/**
 * Wraps each line of the content with the given prefix.
 * @param prefix The prefix to wrap each line with.
 * @param content The content to wrap.
 * @returns The content with each line wrapped with the prefix.
 */
export function wrapInMarkdownBlock(prefix: string, content: string) {
  // split content lines
  const lines = content.split('\n')

  // insert a blank line between each content line, then prefix every line
  const output = lines
    .flatMap((line, index) => (index === 0 ? [line] : ['', line]))
    .map(line => `${prefix}${line}`)
    .join('\n')

  return output
}
