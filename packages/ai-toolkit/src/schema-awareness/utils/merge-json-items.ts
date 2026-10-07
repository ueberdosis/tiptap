import type { JsonItem } from '../types/json-item.js'

/**
 * When new JSON items are added, we need to remove from `items` the items that
 * are duplicated in `newItems`
 * @param items - The original array of JSON items
 * @param newItems - The new array of JSON items to add
 * @returns A new array of JSON items where the items from `newItems` are added
 * and the items from `items` that are duplicated in `newItems` are removed
 */
export function mergeJsonItems(items: JsonItem[], newItems: JsonItem[]): JsonItem[] {
  const newItemsSet = new Set(newItems.map(item => item.extensionName))
  return [...items.filter(item => !newItemsSet.has(item.extensionName)), ...newItems]
}
