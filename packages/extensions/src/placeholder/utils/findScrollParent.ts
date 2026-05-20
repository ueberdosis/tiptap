function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  const overflow = `${style.overflow} ${style.overflowY} ${style.overflowX}`

  return /auto|scroll|overlay/.test(overflow)
}

export function findScrollParent(element: HTMLElement): HTMLElement | Window {
  let scrollParent = element.parentElement

  while (scrollParent) {
    if (isScrollable(scrollParent)) {
      break
    }

    scrollParent = scrollParent.parentElement
  }

  return scrollParent || window
}
