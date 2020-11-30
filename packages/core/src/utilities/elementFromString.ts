export default function elementFromString(value: string): HTMLElement {
  const htmlString = `<div>${value}</div>`
  const parser = new window.DOMParser()
  const element = parser.parseFromString(htmlString, 'text/html').body

  return element
}
