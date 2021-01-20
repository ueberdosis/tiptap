export default function isClass(item: any): boolean {
  return item.constructor?.toString().substring(0, 5) === 'class'
}
