/**
 * Find duplicates in an array.
 */
export function findDuplicates<T>(items: T[]): T[] {
  const filtered = items.filter((el, index) => items.indexOf(el) !== index)

  return Array.from(new Set(filtered))
}
