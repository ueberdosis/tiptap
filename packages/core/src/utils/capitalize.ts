export default function capitalize(value: string = ''): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}