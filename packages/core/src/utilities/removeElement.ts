export default function removeElement(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element)
  }
}
