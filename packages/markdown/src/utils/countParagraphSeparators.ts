/**
 * Count the blank lines separating blocks in a raw markdown string.
 * @param raw The raw markdown token source.
 * @returns The number of blank line separators.
 */
export function countParagraphSeparators(raw: string): number {
  return (raw.replace(/\r\n/g, '\n').match(/\n\n/g) || []).length
}
