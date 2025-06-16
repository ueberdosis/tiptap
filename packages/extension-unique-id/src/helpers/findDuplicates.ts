import { removeDuplicates } from './removeDuplicates.js'

/**
 * Returns a list of duplicated items within an array.
 */
export function findDuplicates(items: any[]): any[] {
  const filtered = items.filter((el, index) => items.indexOf(el) !== index)
  const duplicates = removeDuplicates(filtered)

  return duplicates
}
