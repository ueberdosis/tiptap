import type { Editor } from '@tiptap/core'
import { isNodeEmpty } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'
import type { Decoration } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import { PLUGIN_KEY } from '../constants.js'
import type { PlaceholderOptions } from '../types.js'
import { createPlaceholderDecoration } from './createPlaceholderDecoration.js'

function resolveEmptyNodeClass(
  emptyNodeClass: PlaceholderOptions['emptyNodeClass'],
  props: { editor: Editor; node: Node; pos: number; hasAnchor: boolean },
): string {
  return typeof emptyNodeClass === 'function' ? emptyNodeClass(props) : emptyNodeClass
}

/**
 * Builds the placeholder decorations for the current document state.
 * @param options.editor - The editor instance.
 * @param options.options - The resolved placeholder options.
 * @param options.dataAttribute - The prepared `data-*` attribute name.
 * @param options.doc - The current document node.
 * @param options.selection - The current selection.
 * @returns A decoration set, or `null` when no placeholders should be shown.
 */
export function buildPlaceholderDecorations({
  editor,
  options,
  dataAttribute,
  doc,
  selection,
}: {
  editor: Editor
  options: PlaceholderOptions
  dataAttribute: string
  doc: Node
  selection: Selection
}): DecorationSet | null {
  const active = editor.isEditable || !options.showOnlyWhenEditable

  if (!active) {
    return null
  }

  const { anchor } = selection
  const decorations: Decoration[] = []
  const isEmptyDoc = editor.isEmpty

  const useResolvedPath = options.showOnlyCurrent && !options.includeChildren

  if (useResolvedPath) {
    const resolved = doc.resolve(anchor)

    // When the selection spans the whole document (e.g. an `AllSelection`
    // after Cmd+A), the anchor resolves to the document level (depth 0). In
    // that case the relevant textblock is the node directly after the
    // position rather than an ancestor. otherwise the placeholder would
    // disappear after selecting all and deleting.
    const node = resolved.depth > 0 ? resolved.node(1) : resolved.nodeAfter
    const nodeStart = resolved.depth > 0 ? resolved.before(1) : anchor

    if (node && node.type.isTextblock && isNodeEmpty(node)) {
      const hasAnchor = anchor >= nodeStart && anchor <= nodeStart + node.nodeSize

      decorations.push(
        createPlaceholderDecoration({
          editor,
          isEmptyDoc,
          dataAttribute,
          hasAnchor,
          placeholder: options.placeholder,
          classes: {
            emptyEditor: options.emptyEditorClass,
            emptyNode: resolveEmptyNodeClass(options.emptyNodeClass, {
              editor,
              node,
              pos: nodeStart,
              hasAnchor,
            }),
          },
          node,
          pos: nodeStart,
        }),
      )
    }
  } else {
    const pluginState = PLUGIN_KEY.getState(editor.state)
    const from = pluginState?.topPos ?? 0
    const to = pluginState?.bottomPos ?? doc.content.size

    doc.nodesBetween(from, to, (node, pos) => {
      const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize
      const isEmpty = !node.isLeaf && isNodeEmpty(node)

      if (!node.type.isTextblock) {
        return options.includeChildren
      }

      if ((hasAnchor || !options.showOnlyCurrent) && isEmpty) {
        decorations.push(
          createPlaceholderDecoration({
            editor,
            isEmptyDoc,
            dataAttribute,
            hasAnchor,
            placeholder: options.placeholder,
            classes: {
              emptyEditor: options.emptyEditorClass,
              emptyNode: resolveEmptyNodeClass(options.emptyNodeClass, {
                editor,
                node,
                pos,
                hasAnchor,
              }),
            },
            node,
            pos,
          }),
        )
      }

      return options.includeChildren
    })
  }

  return DecorationSet.create(doc, decorations)
}
