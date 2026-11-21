/**
 * Escape a trailing run of `#` characters so it is not read as the closing
 * sequence of an ATX heading when the output is parsed again.
 *
 * Only hashes at the very end, preceded by a space or making up the whole
 * text, are escaped. A `#` attached to a word, such as `C#`, is left alone.
 *
 * @param text The rendered heading content to escape
 * @returns The text with trailing hashes escaped
 * @example
 * ```ts
 * escapeTrailingHashes('Title ##') // 'Title \\#\\#'
 * ```
 */
export function escapeTrailingHashes(text: string): string {
  return text.replace(/(^|[ \t])(#+)([ \t]*)$/, (_, separator, hashes, trailing) => {
    return `${separator}${(hashes as string).replace(/#/g, '\\#')}${trailing}`
  })
}
