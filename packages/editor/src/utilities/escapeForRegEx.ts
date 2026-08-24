// source: https://stackoverflow.com/a/6969486
export function escapeForRegEx(string: string): string {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}
