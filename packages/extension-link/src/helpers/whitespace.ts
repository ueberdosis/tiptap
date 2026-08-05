// From DOMPurify
// https://github.com/cure53/DOMPurify/blob/main/src/regexp.ts
/**
 * Matches whitespace, including the Unicode spaces that `\s` misses.
 */
export const UNICODE_WHITESPACE_PATTERN =
  '[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]'

/**
 * Matches a single whitespace character.
 */
export const UNICODE_WHITESPACE_REGEX = new RegExp(UNICODE_WHITESPACE_PATTERN)
/**
 * Matches trailing whitespace, so it is kept out of the link.
 */
export const UNICODE_WHITESPACE_REGEX_END = new RegExp(`${UNICODE_WHITESPACE_PATTERN}$`)
/**
 * Matches every whitespace character in a text.
 */
export const UNICODE_WHITESPACE_REGEX_GLOBAL = new RegExp(UNICODE_WHITESPACE_PATTERN, 'g')
