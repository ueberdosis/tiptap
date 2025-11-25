import type { Editor, GetUpdatedPositionResult } from '@tiptap/core'
import { type Transaction, EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import {
  absolutePositionToRelativePosition,
  ProsemirrorBinding,
  relativePositionToAbsolutePosition,
  ySyncPlugin,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'
import * as Y from 'yjs'

import { isChangeOrigin } from '../helpers/isChangeOrigin.js'
import { mapPositionsPluginKey } from './map-positions-plugin.js'

export interface MapPositionsFromTransactionOptions {
  /**
   * The positions to map.
   */
  positions: number[]
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

export function mapPositionsFromTransaction({
  positions,
  transaction,
  editor,
  field,
}: MapPositionsFromTransactionOptions): GetUpdatedPositionResult[] {
  const transactionMap = mapPositionsPluginKey.getState(editor.state)?.transactionMap
  const transactionMapValue = transactionMap?.get(transaction)

  if (!isChangeOrigin(transaction) || !transactionMapValue) {
    return positions.map(position => {
      const mapResult = transaction.mapping.mapResult(position)
      return {
        position: mapResult.pos,
        mapResult,
      }
    })
  }

  const { updateBefore } = transactionMapValue

  // Get or create the "before" binding (cached for performance)
  let beforeDoc: Y.Doc
  let beforeBinding: ProsemirrorBinding
  let beforeFragment: Y.XmlFragment

  if (transactionMapValue.beforeBinding) {
    // Reuse cached binding - eliminates repeated Y.Doc and EditorView creation
    beforeDoc = transactionMapValue.beforeBinding.doc
    beforeBinding = transactionMapValue.beforeBinding.binding
    beforeFragment = beforeDoc.getXmlFragment(field)
  } else {
    // First time mapping from this transaction - create and cache the binding
    beforeDoc = new Y.Doc()
    Y.applyUpdate(beforeDoc, updateBefore)
    beforeFragment = beforeDoc.getXmlFragment(field)
    beforeBinding = new ProsemirrorBinding(beforeFragment)

    // Initialize with a minimal EditorView to build the mapping
    beforeBinding.initView(
      new EditorView(null, {
        state: EditorState.create({
          doc: editor.state.doc,
          plugins: [ySyncPlugin(beforeFragment, {})],
        }),
      }),
    )

    // Force rerender to ensure the mapping is populated
    // eslint-disable-next-line no-underscore-dangle
    beforeBinding._forceRerender()

    // Cache for subsequent calls with the same transaction

    if (!transactionMapValue.beforeBinding) {
      transactionMapValue.beforeBinding = {
        doc: beforeDoc,
        binding: beforeBinding,
      }
    }
  }

  // Convert all positions to relative positions using the "before" state
  const relativePositions = positions.map(position =>
    absolutePositionToRelativePosition(position, beforeFragment, beforeBinding.mapping),
  )

  // Get the current (after) state from the live ySyncPlugin binding
  // This avoids creating a second Y.Doc and applying updateAfter
  const ySyncPluginState = ySyncPluginKey.getState(editor.state)

  if (!ySyncPluginState) {
    throw new Error(
      'ySyncPlugin state not found. This may happen if mapPositionsFromTransaction is called on an editor without the Collaboration extension enabled. Ensure the Collaboration extension is properly initialized.',
    )
  }

  const currentFragment = ySyncPluginState.type
  const currentBinding = ySyncPluginState.binding

  if (!currentFragment.doc) {
    throw new Error('Y.js document not found in current fragment')
  }

  // Convert relative positions back to absolute using the current state
  const absolutePositions = relativePositions.map(
    relativePosition =>
      relativePositionToAbsolutePosition(
        currentFragment.doc,
        currentFragment,
        relativePosition,
        currentBinding.mapping,
      ) || 0,
  )

  return absolutePositions.map(position => ({
    position,
    mapResult: null,
  }))
}
