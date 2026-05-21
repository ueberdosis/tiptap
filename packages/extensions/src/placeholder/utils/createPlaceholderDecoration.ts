import type { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import { Decoration } from '@tiptap/pm/view'

import type { PlaceholderOptions } from '../types.js'

/**
 * Creates a ProseMirror node decoration that applies a placeholder
 * CSS class and data attribute to an empty node.
 * @param options.editor - The editor instance
 * @param options.pos - The position of the node in the document
 * @param options.node - The ProseMirror node
 * @param options.isEmptyDoc - Whether the entire document is empty
 * @param options.hasAnchor - Whether the selection anchor is within the node
 * @param options.dataAttribute - The data attribute name (e.g. `data-placeholder`)
 * @param options.classes - CSS classes for empty nodes and the empty editor
 * @param options.placeholder - The placeholder text or a function that returns it
 * @returns A ProseMirror node decoration with placeholder classes and data attribute
 */
export function createPlaceholderDecoration(options: {
  editor: Editor
  pos: number
  node: Node
  isEmptyDoc: boolean
  hasAnchor: boolean
  dataAttribute: string
  classes: {
    emptyEditor: PlaceholderOptions['emptyEditorClass']
    emptyNode: PlaceholderOptions['emptyNodeClass']
  }
  placeholder: PlaceholderOptions['placeholder']
}) {
  const {
    editor,
    placeholder,
    dataAttribute,
    pos,
    node,
    isEmptyDoc,
    hasAnchor,
    classes: { emptyNode, emptyEditor },
  } = options
  const classes = [emptyNode]

  if (isEmptyDoc) {
    classes.push(emptyEditor)
  }

  return Decoration.node(pos, pos + node.nodeSize, {
    class: classes.join(' '),
    [dataAttribute]:
      typeof placeholder === 'function'
        ? placeholder({
            editor,
            node,
            pos,
            hasAnchor,
          })
        : placeholder,
  })
}
