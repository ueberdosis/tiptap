import type { Editor, GetUpdatedPositionResult } from '@tiptap/core'
import { type Transaction, EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import {
  absolutePositionToRelativePosition,
  ProsemirrorBinding,
  relativePositionToAbsolutePosition,
  ySyncPlugin,
} from '@tiptap/y-tiptap'
import * as Y from 'yjs'

import { isChangeOrigin } from '../helpers/isChangeOrigin.js'
import { mapPositionsPluginKey } from './map-positions-plugin.js'

export interface MapPositionFromTransactionOptions {
  /**
   * The position to map.
   */
  position: number
  /**
   * The transaction
   */
  transaction: Transaction
  /**
   * The editor instance.
   */
  editor: Editor
  /**
   * The name of the field, defined in the collaboration extension,
   * that identifies the document in the Y.js document.
   */
  field: string
}

export function mapPositionFromTransaction({
  position,
  transaction,
  editor,
  field,
}: MapPositionFromTransactionOptions): GetUpdatedPositionResult {
  const transactionMap = mapPositionsPluginKey.getState(editor.state)?.transactionMap
  const transactionMapValue = transactionMap?.get(transaction)

  if (!isChangeOrigin(transaction) || !transactionMapValue) {
    const mapResult = transaction.mapping.mapResult(position)
    return {
      position: mapResult.pos,
      mapResult,
    }
  }

  const { updateBefore, updateAfter } = transactionMapValue

  // Use the previous Y.js state to get the relative position
  const doc = new Y.Doc()
  Y.applyUpdate(doc, updateBefore)

  // To get the relative position, we need the mapping and the fragment. We run
  // this code to generate them.
  const fragment = doc.getXmlFragment(field)
  const binding = new ProsemirrorBinding(fragment)
  binding.initView(
    new EditorView(null, {
      state: EditorState.create({
        doc: editor.state.doc,
        // We need to pass the ySyncPlugin, otherwise the binding throws an
        // error when applying an update.
        plugins: [ySyncPlugin(fragment, {})],
      }),
    }),
  )
  // eslint-disable-next-line no-underscore-dangle
  binding._forceRerender()

  const relativePosition = absolutePositionToRelativePosition(position, fragment, binding.mapping)

  // Use the new Y.js state to get the absolute position
  Y.applyUpdate(doc, updateAfter)
  const absolutePosition = relativePositionToAbsolutePosition(doc, fragment, relativePosition, binding.mapping) || 0

  return {
    position: absolutePosition,
    mapResult: null,
  }
}
