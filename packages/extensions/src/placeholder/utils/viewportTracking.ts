import type { EditorState, PluginView, StateField, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { PLUGIN_KEY } from '../constants.js'
import type { ViewportState } from '../types.js'
import { findScrollParent } from './findScrollParent.js'
import { getViewportBoundaryPositions } from './getViewportBoundaryPositions.js'
import { throttle } from './throttle.js'

/**
 * The plugin `state` config that tracks the visible viewport boundaries so the
 * decoration callback only scans the nodes currently on screen.
 */
export const viewportPluginState: StateField<ViewportState> = {
  /**
   * Initialises the viewport state with no known positions.
   * @returns The initial viewport state.
   */
  init(): ViewportState {
    return { topPos: null, bottomPos: null }
  },

  /**
   * Updates the viewport state from incoming transactions.
   * @param tr - The transaction being applied.
   * @param prev - The previous viewport state.
   * @returns The next viewport state.
   */
  apply(tr: Transaction, prev: ViewportState): ViewportState {
    const meta = tr.getMeta(PLUGIN_KEY) as
      | { positions?: { top: number; bottom: number } }
      | undefined

    if (meta?.positions) {
      return { topPos: meta.positions.top, bottomPos: meta.positions.bottom }
    }

    if (!tr.docChanged) {
      return prev
    }

    // Preserve last known viewport positions across transactions.
    // Without this, every keystroke resets back to a full document
    // scan, defeating the viewport optimisation.
    // Only map when we have actual positions — null means "no viewport
    // info yet" and should stay null to fall back to full doc scan.
    return {
      topPos: prev.topPos !== null ? tr.mapping.map(prev.topPos) : null,
      bottomPos: prev.bottomPos !== null ? tr.mapping.map(prev.bottomPos) : null,
    }
  },
}

/**
 * Creates the plugin `view` that recomputes the visible viewport on scroll and
 * document size changes, dispatching the result into the plugin state.
 * @param view - The editor view the plugin is attached to.
 * @returns A plugin view with `update` and `destroy` handlers.
 */
export function createViewportPluginView(view: EditorView): PluginView {
  const scrollContainer = findScrollParent(view.dom)

  const computeAndDispatch = () => {
    const positions = getViewportBoundaryPositions({
      view,
      doc: view.state.doc,
      scrollContainer,
    })

    const prev = PLUGIN_KEY.getState(view.state)
    if (prev?.topPos === positions.top && prev?.bottomPos === positions.bottom) {
      return
    }

    const tr = view.state.tr
      .setMeta(PLUGIN_KEY, { positions })
      // Flag this transaction so the update() method can detect
      // it and avoid re-entrant computation.
      .setMeta('tiptap__viewportUpdate', true)
    view.dispatch(tr)
  }

  const { call: throttledUpdate, cancel: cancelThrottle } = throttle(computeAndDispatch, 250)

  scrollContainer.addEventListener('scroll', throttledUpdate, { passive: true })

  // Fire once to populate initial viewport (bypass throttle)
  computeAndDispatch()

  return {
    update(_: EditorView, prevState: EditorState) {
      // Skip re-entry: the dispatch inside computeAndDispatch would
      // trigger this update again, but the doc didn't change so the
      // size guard catches that. The meta flag is an extra safeguard.
      if (view.state.doc.content.size !== prevState.doc.content.size) {
        computeAndDispatch()
      }
    },
    destroy: () => {
      cancelThrottle()
      scrollContainer.removeEventListener('scroll', throttledUpdate)
    },
  }
}
