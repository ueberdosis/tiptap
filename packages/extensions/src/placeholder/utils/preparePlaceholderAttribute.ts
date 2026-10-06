/**
 * Prepares the placeholder attribute by ensuring it is properly formatted.
 * @param attr - The placeholder attribute string.
 * @returns The prepared placeholder attribute string.
 */
export function preparePlaceholderAttribute(attr: string): string {
  return (
    attr
      // replace whitespace with dashes
      .replace(/\s+/g, '-')
      // replace non-alphanumeric  characters
      // or special chars like $, %, &, etc.
      // but not dashes
      .replace(/[^a-zA-Z0-9-]/g, '')
      // and replace any numeric character at the start
      .replace(/^[0-9-]+/, '')
      // and finally replace any stray, leading dashes
      .replace(/^-+/, '')
      .toLowerCase()
  )
}
