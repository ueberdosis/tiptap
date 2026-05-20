import type { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import { Decoration } from '@tiptap/pm/view'

import type { PlaceholderOptions } from '../types.js'

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
  const { editor, placeholder, dataAttribute, pos, node, isEmptyDoc, hasAnchor } = options
  const classes = [options.classes.emptyNode]

  if (isEmptyDoc) {
    classes.push(options.classes.emptyEditor)
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
