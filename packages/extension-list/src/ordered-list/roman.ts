const ROMAN_NUMERALS: [number, string][] = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
]

/**
 * Convert a number to lowercase roman numerals.
 * @example toRoman(1) // 'i'
 * @example toRoman(4) // 'iv'
 */
export function toRoman(num: number): string {
  let remaining = num
  let result = ''

  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }

  return result
}

/**
 * Convert a number to uppercase roman numerals.
 * @example toRomanUpper(1) // 'I'
 * @example toRomanUpper(4) // 'IV'
 */
export function toRomanUpper(num: number): string {
  return toRoman(num).toUpperCase()
}

/**
 * Extract the list marker type from a marker string.
 * Supports "1", "a", "A", "i", "I" marker styles.
 *
 * @param marker The text content of the list marker (e.g. "a", "1", "iii")
 * @returns The normalized type string, or undefined for default numeric type
 */
export function detectMarkerType(marker: string): string | undefined {
  // Empty or numeric marker → default
  if (!marker || /^\d+$/.test(marker)) {
    return undefined
  }

  // Explicit alpha markers: only "a" and "A" are valid
  if (marker === 'a') {
    return 'a'
  }

  if (marker === 'A') {
    return 'A'
  }

  // Roman numeral markers (single or multi-character)
  if (/^[ivxlcdmIVXLCDM]+$/.test(marker)) {
    return marker === marker.toLowerCase() ? 'i' : 'I'
  }

  return undefined
}

/**
 * Returns the list marker prefix for a given item at a given index.
 *
 * @param type The list type attribute (e.g. "a", "A", "i", "I", null/undefined for default)
 * @param index The zero-based index of the list item
 * @param separator The separator to use (default: ". ")
 * @returns The marker string (e.g. "a. ", "I. ", "1. ")
 */
export function getListMarker(
  type: string | null | undefined,
  index: number,
  separator = '. ',
): string {
  const position = index + 1

  if (!type || type === '1') {
    return `${position}${separator}`
  }

  switch (type) {
    case 'a':
      return `${toRomanAlpha(position)}${separator}`
    case 'A':
      return `${toRomanAlpha(position).toUpperCase()}${separator}`
    case 'i':
      return `${toRoman(position)}${separator}`
    case 'I':
      return `${toRomanUpper(position)}${separator}`
    default:
      return `${position}${separator}`
  }
}

const ALPHA_NUMERALS = 'abcdefghijklmnopqrstuvwxyz'

function toRomanAlpha(num: number): string {
  if (num <= 26) {
    return ALPHA_NUMERALS[num - 1]
  }

  // For numbers beyond 26, use a simple multi-letter scheme
  const first = Math.floor((num - 1) / 26) - 1
  const second = (num - 1) % 26

  if (first < 0) {
    return ALPHA_NUMERALS[second]
  }

  return ALPHA_NUMERALS[first] + ALPHA_NUMERALS[second]
}
