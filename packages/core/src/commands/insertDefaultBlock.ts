import type { Node as ProseMirrorNode, Fragment, ResolvedPos } from '@tiptap/pm/model'

import { createNodeFromContent } from '../helpers/createNodeFromContent.js'
import { defaultBlockAt } from '../helpers/defaultBlockAt.js'
import { selectionToInsertionEnd } from '../helpers/selectionToInsertionEnd.js'
import type { Content, RawCommands } from '../types.js'

export interface InsertDefaultBlockOptions {
  /**
   * The position to insert the block at.
   * Accepts a number or a resolved ProseMirror position.
   * Defaults to the current caret position.
   */
  pos?: number | ResolvedPos

  /**
   * Attributes to apply to the inserted node.
   * Only attributes that match the node's schema will be applied.
   */
  attrs?: Record<string, any>

  /**
   * Content to insert into the block.
   * Accepts string (plain text or HTML), ProseMirror node, or Fragment.
   */
  content?: Content | ProseMirrorNode | Fragment

  /**
   * Whether to update the selection after inserting the content.
   * @default true
   */
  updateSelection?: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertDefaultBlock: {
      /**
       * Insert a default content block at the given position.
       * Returns false when the default block can't be inserted at that position.
       * @example editor.commands.insertDefaultBlock()
       * @example editor.commands.insertDefaultBlock({ pos: 5, content: 'Hello' })
       */
      insertDefaultBlock: (options?: InsertDefaultBlockOptions) => ReturnType
    }
  }
}

export const insertDefaultBlock: RawCommands['insertDefaultBlock'] =
  (options = {}) =>
  ({ tr, dispatch, editor }) => {
    const { pos, attrs, content, updateSelection = true } = options

    let $pos: ResolvedPos

    if (typeof pos === 'number') {
      $pos = tr.doc.resolve(pos)
    } else if (pos) {
      $pos = pos
    } else {
      $pos = tr.selection.$from
    }

    const defaultType = defaultBlockAt($pos.parent.contentMatchAt($pos.index()))

    if (!defaultType) {
      return false
    }

    const validAttrKeys = Object.keys(defaultType.spec.attrs || {})
    const filteredAttrs = attrs
      ? Object.fromEntries(Object.entries(attrs).filter(([key]) => validAttrKeys.includes(key)))
      : {}

    let node: ProseMirrorNode | null | undefined

    if (content) {
      const parsed = createNodeFromContent(content, editor.schema)
      node = defaultType.createAndFill(filteredAttrs, parsed)
    } else {
      node = defaultType.createAndFill(filteredAttrs)
    }

    if (!node) {
      return false
    }

    if (dispatch) {
      tr.insert($pos.pos, node)

      if (updateSelection) {
        selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
      }
    }

    return true
  }
