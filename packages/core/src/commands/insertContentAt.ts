import { Fragment, Node as ProseMirrorNode, ParseOptions } from 'prosemirror-model'

import { createNodeFromContent } from '../helpers/createNodeFromContent'
import { selectionToInsertionEnd } from '../helpers/selectionToInsertionEnd'
import {
  Content,
  Range,
  RawCommands,
} from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertContentAt: {
      /**
       * Insert a node or string of HTML at a specific position.
       */
      insertContentAt: (
        position: number | Range,
        value: Content,
        options?: {
          parseOptions?: ParseOptions,
          updateSelection?: boolean,
        },
      ) => ReturnType,
    }
  }
}

const isFragment = (nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment => {
  return nodeOrFragment.toString().startsWith('<')
}

export const insertContentAt: RawCommands['insertContentAt'] = (position, value, options) => ({ tr, dispatch, editor }) => {
  if (dispatch) {
    options = {
      parseOptions: {},
      updateSelection: true,
      ...options,
    }

    const content = createNodeFromContent(value, editor.schema, {
      parseOptions: {
        preserveWhitespace: 'full',
        ...options.parseOptions,
      },
    })

    // don’t dispatch an empty fragment because this can lead to strange errors
    if (content.toString() === '<>') {
      return true
    }

    let { from, to } = typeof position === 'number'
      ? { from: position, to: position }
      : position

    let isOnlyTextContent = true
    let isOnlyBlockContent = true
    const nodes = isFragment(content)
      ? content
      : [content]

    nodes.forEach(node => {
      // check if added node is valid
      node.check()

      isOnlyTextContent = isOnlyTextContent
        ? node.isText && node.marks.length === 0
        : false

      isOnlyBlockContent = isOnlyBlockContent
        ? node.isBlock
        : false
    })

    // check if we can replace the wrapping node by
    // the newly inserted content
    // example:
    // replace an empty paragraph by an inserted image
    // instead of inserting the image below the paragraph
    if (from === to && isOnlyBlockContent) {
      const { parent } = tr.doc.resolve(from)
      const isEmptyTextBlock = parent.isTextblock
        && !parent.type.spec.code
        && !parent.childCount

      if (isEmptyTextBlock) {
        from -= 1
        to += 1
      }
    }

    // if there is only plain text we have to use `insertText`
    // because this will keep the current marks
    if (isOnlyTextContent) {
      tr.insertText(value as string, from, to)
    } else {
      tr.replaceWith(from, to, content)
    }

    // set cursor at end of inserted content
    if (options.updateSelection) {
      selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
    }
  }

  return true
}
