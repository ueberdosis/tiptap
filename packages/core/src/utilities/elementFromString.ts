export default function elementFromString(value: string): HTMLElement {
  return new window.DOMParser().parseFromString(value, 'text/html').body
}
