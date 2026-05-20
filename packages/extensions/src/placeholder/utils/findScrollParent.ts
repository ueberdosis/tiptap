export function findScrollParent(element: HTMLElement): HTMLElement | Window {
  let scrollParent = element.parentElement

  while (scrollParent) {
    const overflowY = getComputedStyle(scrollParent).overflowY

    if (overflowY === 'auto' || overflowY === 'scroll') {
      break
    }

    scrollParent = scrollParent.parentElement
  }

  return scrollParent || window
}
