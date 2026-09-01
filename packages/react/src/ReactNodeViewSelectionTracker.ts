import { isTextSelection } from '@tiptap/core'
import type { Editor, EditorEvents } from '@tiptap/core'
import type { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'

/** A React node view that can be tracked for selection changes. */
interface TrackedNodeView {
  node: PMNode
  getPos(): number | undefined
  setSelectionInside(selectionInside: boolean): void
}

/** A shared ancestor of the current text selection. */
interface SelectionAncestor {
  node: PMNode
  position: number
}

function isSameAncestor($from: ResolvedPos, $to: ResolvedPos, depth: number): boolean {
  return $from.node(depth) === $to.node(depth) && $from.before(depth) === $to.before(depth)
}

function getSelectionAncestors(editor: Editor): SelectionAncestor[] {
  const { selection } = editor.state

  if (!isTextSelection(selection)) {
    return []
  }

  const { $from, $to } = selection
  const ancestors: SelectionAncestor[] = []
  const maxDepth = Math.min($from.depth, $to.depth)

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const node = $from.node(depth)
    const position = $from.before(depth)

    if (!isSameAncestor($from, $to, depth)) {
      break
    }

    ancestors.push({ node, position })
  }

  return ancestors
}

function findView(
  views: Set<TrackedNodeView> | undefined,
  position: number,
): TrackedNodeView | undefined {
  if (!views) {
    return undefined
  }

  if (views.size === 1) {
    const [view] = views

    return view
  }

  return Array.from(views).find(view => view.getPos() === position)
}

class ReactNodeViewSelectionTracker {
  private editor: Editor

  private views = new Set<TrackedNodeView>()

  private viewsByNode = new Map<PMNode, Set<TrackedNodeView>>()

  private insideViews = new Set<TrackedNodeView>()

  private syncQueued = false

  constructor(editor: Editor) {
    this.editor = editor
  }

  register(view: TrackedNodeView) {
    if (this.views.size === 0) {
      this.editor.on('transaction', this.handleTransaction)
    }

    this.views.add(view)
    this.addNode(view.node, view)
    this.scheduleSync()
  }

  unregister(view: TrackedNodeView) {
    this.views.delete(view)
    this.insideViews.delete(view)
    this.removeNode(view.node, view)

    if (this.views.size === 0) {
      this.editor.off('transaction', this.handleTransaction)
    }
  }

  private addNode(node: PMNode, view: TrackedNodeView) {
    const views = this.viewsByNode.get(node) ?? new Set<TrackedNodeView>()

    views.add(view)
    this.viewsByNode.set(node, views)
  }

  private removeNode(node: PMNode, view: TrackedNodeView) {
    const views = this.viewsByNode.get(node)

    if (!views) {
      return
    }

    views.delete(view)

    if (views.size === 0) {
      this.viewsByNode.delete(node)
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

  private handleTransaction = ({ transaction }: EditorEvents['transaction']) => {
    if (transaction.docChanged) {
      this.rebuildNodeIndex()
    }

    this.scheduleSync()
  }

  private rebuildNodeIndex() {
    this.viewsByNode.clear()

    for (const view of this.views) {
      this.addNode(view.node, view)
    }
  }

  private sync() {
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

    for (const { node, position } of getSelectionAncestors(this.editor)) {
      const view = findView(this.viewsByNode.get(node), position)

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
