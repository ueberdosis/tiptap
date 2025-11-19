import type { Editor, MapPositionFromTransactionResult } from '@tiptap/core'
import { type Transaction, EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import {
  absolutePositionToRelativePosition,
  ProsemirrorBinding,
  relativePositionToAbsolutePosition,
} from '@tiptap/y-tiptap'
import * as Y from 'yjs'

import { isChangeOrigin } from '../helpers/isChangeOrigin.js'
import { mapPositionsPluginKey } from './map-positions-plugin.js'

export function mapPositionFromTransaction(
  position: number,
  transaction: Transaction,
  editor: Editor,
): MapPositionFromTransactionResult {
  const transactionMap = mapPositionsPluginKey.getState(editor.state)?.transactionMap
  const editorStates = transactionMap?.get(transaction)

  if (!isChangeOrigin(transaction) || !editorStates) {
    const mapResult = transaction.mapping.mapResult(position)
    return {
      position: mapResult.pos,
      mapResult,
    }
  }

  const { updateBefore, updateAfter } = editorStates

  // Use the previous Y.js state to get the relative position
  const doc = new Y.Doc()
  Y.applyUpdate(doc, updateBefore)

  const fragment = doc.getXmlFragment('default')
  const binding = new ProsemirrorBinding(fragment)

  // We have to run this code to generate the mapping
  binding.initView(
    new EditorView(null, {
      state: EditorState.create({
        doc: editor.state.doc,
      }),
    }),
  )
  // eslint-disable-next-line no-underscore-dangle
  binding._forceRerender()

  const relativePosition = absolutePositionToRelativePosition(position, fragment, binding.mapping)

  // Use the new Y.js state to get the absolute position
  try {
    // For some reason, this fails
    Y.applyUpdate(doc, updateAfter)
  } catch (error) {
    // Ignore the error
    console.error(error)
  }
  const absolutePosition = relativePositionToAbsolutePosition(doc, fragment, relativePosition, binding.mapping) || 0

  return {
    position: absolutePosition,
    mapResult: null,
  }
}
