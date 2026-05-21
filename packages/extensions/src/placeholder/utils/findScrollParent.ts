/**
 * Checks if an element is scrollable by testing its overflow properties.
 * Elements with `overflow: hidden` or `overflow: clip` are intentionally
 * excluded — they clip content but don't emit scroll events.
 */
function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  const overflow = `${style.overflow} ${style.overflowY} ${style.overflowX}`

  return /auto|scroll|overlay/.test(overflow)
}

export function findScrollParent(element: HTMLElement): HTMLElement | Window {
  let el: HTMLElement | null = element

  while (el) {
    if (isScrollable(el)) {
      return el
    }

    // Check if we hit a Shadow DOM boundary. If so, jump to the shadow host
    // and continue traversing the light DOM.
    const parent = el.parentElement
    if (!parent) {
      const root = el.getRootNode()
      if (root instanceof ShadowRoot) {
        el = root.host as HTMLElement
        continue
      }

      return window
    }

    el = parent
  }

  return window
}
