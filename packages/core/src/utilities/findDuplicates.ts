export function findDuplicates(items: any[]): any[] {
  const filtered = items.filter((el, index) => items.indexOf(el) !== index)

  return Array.from(new Set(filtered))
}
