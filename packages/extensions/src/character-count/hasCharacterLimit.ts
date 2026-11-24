/** Zero, null, and undefined disable the character limit. */
export function hasCharacterLimit(limit: number | null | undefined): limit is number {
  return typeof limit === 'number' && limit !== 0
}
