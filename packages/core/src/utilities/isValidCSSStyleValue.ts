/**
 * Checks whether a value can be inserted into one CSS declaration.
 * @param value - The CSS property value.
 * @returns Whether the value stays inside one declaration.
 */
export function isValidCSSStyleValue(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !/[;{}]/.test(value)
}
