export default function elementFromString(value: string): HTMLDivElement {
  const element = document.createElement('div')
  element.innerHTML = value.trim()

  return element
}