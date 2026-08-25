/**
 * Backslash-escape markdown inline syntax characters so they render as literal text.
 * @param text The text to escape.
 * @returns The text with markdown characters escaped.
 */
export function escapeMarkdownSyntax(text: string): string {
  return text.replace(/([\\`*_[\]~])/g, '\\$1')
}
