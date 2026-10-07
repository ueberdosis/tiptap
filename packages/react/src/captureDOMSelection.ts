type SelectionRoot = Node & { getSelection?: () => Selection | null }

/**
 * Saves the DOM selection inside `element`, returns a function to put it back.
 * Browsers drop the selection when an element moves, so restore it after the move.
 */
export function captureDOMSelection(element: HTMLElement): (() => void) | null {
  const root = element.getRootNode() as SelectionRoot
  const selection =
    typeof root.getSelection === 'function'
      ? root.getSelection()
      : element.ownerDocument?.defaultView?.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection

  if (!anchorNode || !focusNode) {
    return null
  }

  if (!element.contains(anchorNode) || !element.contains(focusNode)) {
    return null
  }

  return () => {
    try {
      selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
    } catch {
      // The saved nodes can be gone by now.
    }
  }
}
