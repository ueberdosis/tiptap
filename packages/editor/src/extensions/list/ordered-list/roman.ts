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

const ALPHA_NUMERALS = 'abcdefghijklmnopqrstuvwxyz'

/** Alpha list markers support at most 2 letters (a–z, aa–zz), matching {@link fromAlpha}. */
export const ORDERED_LIST_ALPHA_MARKER_PATTERN = '[a-zA-Z]{1,2}'

/**
 * Marker segment for ordered list lines: numeric, roman, or 1–2 letter alpha.
 * Roman is matched before alpha so "iii" is roman; invalid romans like "aa" fall through to alpha.
 */
export const ORDERED_LIST_MARKER_PATTERN = String.raw`\d+|[ivxlcdmIVXLCDM]+|${ORDERED_LIST_ALPHA_MARKER_PATTERN}`

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

function fromRoman(roman: string): number {
  const lower = roman.toLowerCase()
  let index = 0
  let result = 0

  while (index < lower.length) {
    let matched = false

    for (const [value, numeral] of ROMAN_NUMERALS) {
      if (lower.startsWith(numeral, index)) {
        result += value
        index += numeral.length
        matched = true
        break
      }
    }

    if (!matched) {
      return 0
    }
  }

  return result
}

function isValidRoman(marker: string): boolean {
  if (!/^[ivxlcdmIVXLCDM]+$/.test(marker)) {
    return false
  }

  const value = fromRoman(marker)

  if (value <= 0) {
    return false
  }

  const expected = marker === marker.toLowerCase() ? toRoman(value) : toRomanUpper(value)

  return expected === marker
}

function fromAlpha(marker: string): number {
  const lower = marker.toLowerCase()

  if (lower.length === 1) {
    return lower.charCodeAt(0) - 'a'.charCodeAt(0) + 1
  }

  if (lower.length === 2) {
    const first = lower.charCodeAt(0) - 'a'.charCodeAt(0)
    const second = lower.charCodeAt(1) - 'a'.charCodeAt(0)

    return (first + 1) * 26 + second + 1
  }

  return 0
}

function toRomanAlpha(num: number): string {
  if (num <= 26) {
    return ALPHA_NUMERALS[num - 1]
  }

  const first = Math.floor((num - 1) / 26) - 1
  const second = (num - 1) % 26

  if (first < 0) {
    return ALPHA_NUMERALS[second]
  }

  return ALPHA_NUMERALS[first] + ALPHA_NUMERALS[second]
}

/**
 * Extract the list marker type from a marker string.
 * Supports "1", "a", "A", "i", "I" marker styles.
 *
 * @param marker The text content of the list marker (e.g. "a", "1", "iii", "b")
 * @returns The normalized type string, or undefined for default numeric type
 */
export function detectMarkerType(marker: string): string | undefined {
  if (!marker || /^\d+$/.test(marker)) {
    return undefined
  }

  if (isValidRoman(marker)) {
    return marker === marker.toLowerCase() ? 'i' : 'I'
  }

  if (/^[a-z]{1,2}$/.test(marker)) {
    return 'a'
  }

  if (/^[A-Z]{1,2}$/.test(marker)) {
    return 'A'
  }

  return undefined
}

/**
 * Convert a list marker string to its numeric start position.
 *
 * @param marker The text content of the list marker (e.g. "3", "b", "II")
 * @returns The 1-based start value for the ordered list
 */
export function markerToStart(marker: string): number {
  if (/^\d+$/.test(marker)) {
    return parseInt(marker, 10)
  }

  const type = detectMarkerType(marker)

  if (type === 'i' || type === 'I') {
    return fromRoman(marker)
  }

  if (type === 'a' || type === 'A') {
    const start = fromAlpha(marker)

    return start > 0 ? start : 1
  }

  const parsed = parseInt(marker, 10)

  return Number.isNaN(parsed) ? 1 : parsed
}

function startToMarker(type: string, start: number): string {
  if (type === 'numeric') {
    return String(start)
  }

  switch (type) {
    case 'a':
      return toRomanAlpha(start)
    case 'A':
      return toRomanAlpha(start).toUpperCase()
    case 'i':
      return toRoman(start)
    case 'I':
      return toRomanUpper(start)
    default:
      return String(start)
  }
}

/**
 * Returns true when all markers share the same style and increment by 1.
 * Style is inferred from the first marker so ambiguous letters (e.g. "c", "i")
 * are not re-classified differently on later lines.
 */
export function areOrderedListMarkersSequential(markers: string[]): boolean {
  if (markers.length === 0) {
    return false
  }

  const firstType = detectMarkerType(markers[0]) ?? 'numeric'
  const firstStart = markerToStart(markers[0])

  if (firstStart < 1) {
    return false
  }

  for (let i = 0; i < markers.length; i++) {
    const expected = startToMarker(firstType, firstStart + i)

    if (markers[i] !== expected) {
      return false
    }
  }

  return true
}

export interface ParsedListMarker {
  type?: string
  start: number
}

/**
 * Parse a list marker into HTML ordered-list attrs (type + start).
 */
export function parseListMarker(marker: string): ParsedListMarker {
  return {
    type: detectMarkerType(marker),
    start: markerToStart(marker),
  }
}

/**
 * Build orderedList node attrs from the first list item marker.
 */
export function buildOrderedListAttrsFromMarker(marker: string): Record<string, string | number> {
  const { type, start } = parseListMarker(marker)
  const attrs: Record<string, string | number> = {}

  if (type) {
    attrs.type = type
  }

  if (start !== 1) {
    attrs.start = start
  }

  return attrs
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
