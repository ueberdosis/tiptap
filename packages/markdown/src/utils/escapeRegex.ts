/**
 * Escape special characters in a string so it can be used inside a RegExp.
 * @param str The string to escape.
 * @returns The string with regex metacharacters escaped.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
