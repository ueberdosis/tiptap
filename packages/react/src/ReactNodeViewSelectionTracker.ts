import type { Editor } from '@tiptap/core'

import { getTextSelectionAncestorPositions } from './lib/utils/getTextSelectionAncestorPositions.js'

/** A React node view that receives `selectionInside` updates. */
interface TrackedNodeView {
  dom: HTMLElement
  setSelectionInside(selectionInside: boolean): void
}

class ReactNodeViewSelectionTracker {
  private editor: Editor

  private views = new WeakMap<Node, TrackedNodeView>()

  private viewCount = 0

  private insideViews = new Set<TrackedNodeView>()

  private syncQueued = false

  constructor(editor: Editor) {
    this.editor = editor
  }

  register(view: TrackedNodeView) {
    if (this.viewCount === 0) {
      this.editor.on('transaction', this.handleTransaction)
    }

    this.views.set(view.dom, view)
    this.viewCount += 1
    this.scheduleSync()
  }

  unregister(view: TrackedNodeView) {
    this.views.delete(view.dom)
    this.viewCount -= 1
    this.insideViews.delete(view)

    if (this.viewCount === 0) {
      this.editor.off('transaction', this.handleTransaction)
    }
  }

  private scheduleSync = () => {
    if (this.syncQueued) {
      return
    }

    this.syncQueued = true

    queueMicrotask(() => {
      this.syncQueued = false
      this.sync()
    })
  }

  private handleTransaction = () => this.scheduleSync()

  private sync() {
    if (this.viewCount === 0 || this.editor.isDestroyed) {
      return
    }

    const nextInsideViews = this.findInsideViews()

    this.updateViews(this.insideViews, nextInsideViews, false)
    this.updateViews(nextInsideViews, this.insideViews, true)

    this.insideViews = nextInsideViews
  }

  private updateViews(
    views: Set<TrackedNodeView>,
    unchangedViews: Set<TrackedNodeView>,
    selectionInside: boolean,
  ) {
    for (const view of views) {
      if (!unchangedViews.has(view)) {
        view.setSelectionInside(selectionInside)
      }
    }
  }

  private findInsideViews(): Set<TrackedNodeView> {
    const insideViews = new Set<TrackedNodeView>()

    for (const position of getTextSelectionAncestorPositions(this.editor.state.selection)) {
      const dom = this.editor.view.nodeDOM(position)
      const view = dom ? this.views.get(dom) : undefined

      if (view) {
        insideViews.add(view)
      }
    }

    return insideViews
  }
}

const trackers = new WeakMap<Editor, ReactNodeViewSelectionTracker>()

export function getReactNodeViewSelectionTracker(editor: Editor): ReactNodeViewSelectionTracker {
  let tracker = trackers.get(editor)

  if (!tracker) {
    tracker = new ReactNodeViewSelectionTracker(editor)
    trackers.set(editor, tracker)
  }

  return tracker
}
