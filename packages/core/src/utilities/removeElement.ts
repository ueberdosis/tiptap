export default function removeElement(element: HTMLElement): void {
  if (element?.parentNode) {
    element.parentNode.removeChild(element)
  }
}
