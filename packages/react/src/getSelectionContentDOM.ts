import type { EditorView } from '@tiptap/pm/view'

/** Returns the React node view content element that holds the DOM selection, if any. */
export function getSelectionContentDOM(view: EditorView): HTMLElement | null {
  const root = view.root as (Document | ShadowRoot) & { getSelection?: () => Selection | null }
  const selection = root.getSelection?.() ?? view.dom.ownerDocument.getSelection()
  const anchor = selection?.anchorNode
  const element = anchor?.nodeType === 1 ? (anchor as Element) : anchor?.parentElement
  const contentDOM = element?.closest<HTMLElement>('[data-node-view-content-react]')

  return contentDOM && view.dom.contains(contentDOM) ? contentDOM : null
}
