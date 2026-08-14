/**
 * Wraps each line of the content with the given prefix.
 * @param prefix The prefix to wrap each line with.
 * @param content The content to wrap.
 * @returns The content with each line wrapped with the prefix.
 */
export function wrapInMarkdownBlock(prefix: string, content: string) {
  // split content lines
  const lines = content.split('\n')

  // add empty strings between every line
  const output = lines
    // add empty lines between each block
    .flatMap(line => [line, ''])
    // add the prefix to each line
    .map(line => `${prefix}${line}`)
    .join('\n')

  return output.slice(0, output.length - 1)
}
