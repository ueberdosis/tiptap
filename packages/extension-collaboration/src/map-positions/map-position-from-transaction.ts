import type { Editor, MapPositionFromTransactionResult } from '@tiptap/core'
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

export function mapPositionFromTransaction(
  position: number,
  transaction: Transaction,
  editor: Editor,
  field: string,
): MapPositionFromTransactionResult {
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
