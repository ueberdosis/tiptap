/**
 * Custom `EditorView` subclass for the React-native renderer.
 *
 * Strategy: let PM construct normally and render its docView into our
 * mount element. Then immediately wipe that DOM and resume control:
 * React renders the document tree, and `attachReactRoot` swaps PM's
 * `docView` for the React-built descriptor tree.
 */

import { EditorView } from '@tiptap/pm/view'

import type { ReactNodeViewDesc } from './viewdesc/index.js'

/** PM-view exposes `domObserver` internally; we narrow the type to access it. */
type WithInternals = {
  domObserver: { start(): void; stop(): void }
  docView: ReactNodeViewDesc
}

export class ReactEditorView extends EditorView {
  /** Marker so consumers (and the DOM observer) can branch on the renderer. */
  readonly isReactEditorView = true

  constructor(place: ConstructorParameters<typeof EditorView>[0], props: ConstructorParameters<typeof EditorView>[1]) {
    super(place, props)
    // PM just rendered the doc into view.dom. Wipe it — React will
    // own this element from here on. Pause the MutationObserver so
    // the wipe doesn't generate a spurious transaction.
    const self = this as unknown as WithInternals
    self.domObserver.stop()
    this.dom.replaceChildren()
  }

  /**
   * Replace PM's docView with the React-built descriptor tree.
   * Called by the React layer after `<DocNodeView>` has assembled
   * its descriptors in a layout effect.
   */
  attachReactRoot(docDesc: ReactNodeViewDesc): void {
    const self = this as unknown as WithInternals
    self.docView = docDesc
    // Resume the MutationObserver so typing produces transactions.
    self.domObserver.start()
  }
}
