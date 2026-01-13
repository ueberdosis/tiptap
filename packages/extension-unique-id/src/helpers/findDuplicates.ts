/**
 * Returns a list of duplicated items within an array.
 */
export function findDuplicates(items: any[]): any[] {
  const seen = new Set()
  const duplicates = new Set<any>()

  for (const item of items) {
    if (seen.has(item)) {
      duplicates.add(item)
    } else {
      seen.add(item)
    }
  }

  return Array.from(duplicates)
}
