export default function removeElement(element: HTMLElement) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element)
  }
}
