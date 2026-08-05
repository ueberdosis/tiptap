// source: https://stackoverflow.com/a/6969486
/**
 * Escape a string so it can be used inside a regular expression.
 */
export function escapeForRegEx(string: string): string {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}
