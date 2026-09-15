/** True when text already looks like a URL, not just a link label. */
export function isUrlLike(text: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(text) || text.startsWith('www.')
}
