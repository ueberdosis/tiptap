/**
 * Custom `EditorView` subclass for the React-native renderer.
 *
 * `attachReactRoot` installs the React-built descriptor tree as PM's
 * docView once `<DocNodeView>` has assembled its descriptors.
 */

import { EditorView } from '@tiptap/pm/view'

import type { ReactNodeViewDesc } from './viewdesc/index.js'

export class ReactEditorView extends EditorView {
  /** Marker so consumers can branch on the renderer. */
  readonly isReactEditorView = true

  attachReactRoot(docDesc: ReactNodeViewDesc): void {
    ;(this as unknown as { docView: ReactNodeViewDesc }).docView = docDesc
  }
}
