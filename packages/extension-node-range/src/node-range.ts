import { Extension } from '@tiptap/core'
import type { SelectionRange } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { getNodeRangeDecorations } from './helpers/getNodeRangeDecorations.js'
import { getSelectionRanges } from './helpers/getSelectionRanges.js'
import { isNodeRangeSelection } from './helpers/isNodeRangeSelection.js'
import { NodeRangeSelection } from './helpers/NodeRangeSelection.js'

export interface NodeRangeOptions {
  depth: number | undefined
  key: 'Shift' | 'Control' | 'Alt' | 'Meta' | 'Mod' | null | undefined
}

export const NodeRange = Extension.create<NodeRangeOptions>({
  name: 'nodeRange',

  addOptions() {
    return {
      depth: undefined,
      key: 'Mod',
    }
  },

  addKeyboardShortcuts() {
    return {
      // extend NodeRangeSelection upwards
      'Shift-ArrowUp': ({ editor }) => {
        const { depth } = this.options
        const { view, state } = editor
        const { doc, selection, tr } = state
        const { anchor, head } = selection

        if (!isNodeRangeSelection(selection)) {
          const nodeRangeSelection = NodeRangeSelection.create(doc, anchor, head, depth, -1)

          tr.setSelection(nodeRangeSelection)
          view.dispatch(tr)

          return true
        }

        const nodeRangeSelection = selection.extendBackwards()

        tr.setSelection(nodeRangeSelection)
        view.dispatch(tr)

        return true
      },

      // extend NodeRangeSelection downwards
      'Shift-ArrowDown': ({ editor }) => {
        const { depth } = this.options
        const { view, state } = editor
        const { doc, selection, tr } = state
        const { anchor, head } = selection

        if (!isNodeRangeSelection(selection)) {
          const nodeRangeSelection = NodeRangeSelection.create(doc, anchor, head, depth)

          tr.setSelection(nodeRangeSelection)
          view.dispatch(tr)

          return true
        }

        const nodeRangeSelection = selection.extendForwards()

        tr.setSelection(nodeRangeSelection)
        view.dispatch(tr)

        return true
      },

      // add `NodeRangeSelection` to all nodes
      'Mod-a': ({ editor }) => {
        const { depth } = this.options
        const { view, state } = editor
        const { doc, tr } = state
        const nodeRangeSelection = NodeRangeSelection.create(doc, 0, doc.content.size, depth)

        tr.setSelection(nodeRangeSelection)
        view.dispatch(tr)

        return true
      },
    }
  },

  onSelectionUpdate() {
    const { selection } = this.editor.state

    if (isNodeRangeSelection(selection)) {
      this.editor.view.dom.classList.add('ProseMirror-noderangeselection')
    }
  },

  addProseMirrorPlugins() {
    let hideTextSelection = false
    let activeMouseSelection = false

    return [
      new Plugin({
        key: new PluginKey('nodeRange'),

        props: {
          attributes: () => {
            if (hideTextSelection) {
              return {
                class: 'ProseMirror-noderangeselection',
              }
            }

            return { class: '' }
          },

          handleDOMEvents: {
            mousedown: (view, event) => {
              const { key } = this.options
              const isMac = /Mac/.test(navigator.platform)
              const isShift = !!event.shiftKey
              const isControl = !!event.ctrlKey
              const isAlt = !!event.altKey
              const isMeta = !!event.metaKey
              const isMod = isMac ? isMeta : isControl

              if (
                key === null ||
                key === undefined ||
                (key === 'Shift' && isShift) ||
                (key === 'Control' && isControl) ||
                (key === 'Alt' && isAlt) ||
                (key === 'Meta' && isMeta) ||
                (key === 'Mod' && isMod)
              ) {
                activeMouseSelection = true
              }

              if (!activeMouseSelection) {
                return false
              }

              document.addEventListener(
                'mouseup',
                () => {
                  activeMouseSelection = false

                  const { state } = view
                  const { doc, selection, tr } = state
                  const { $anchor, $head } = selection

                  if ($anchor.sameParent($head)) {
                    return
                  }

                  const nodeRangeSelection = NodeRangeSelection.create(doc, $anchor.pos, $head.pos, this.options.depth)

                  tr.setSelection(nodeRangeSelection)
                  view.dispatch(tr)
                },
                { once: true },
              )

              return false
            },
          },

          // when selecting some text we want to render some decorations
          // to preview a `NodeRangeSelection`
          decorations: state => {
            const { selection } = state
            const isNodeRange = isNodeRangeSelection(selection)

            hideTextSelection = false

            if (!activeMouseSelection) {
              if (!isNodeRange) {
                return null
              }

              hideTextSelection = true

              return getNodeRangeDecorations(selection.ranges as SelectionRange[])
            }

            const { $from, $to } = selection

            // selection is probably in the same node like a paragraph
            // so we don’t render decorations and show
            // a simple text selection instead
            if (!isNodeRange && $from.sameParent($to)) {
              return null
            }

            // try to calculate some node ranges
            const nodeRanges = getSelectionRanges($from, $to, this.options.depth)

            if (!nodeRanges.length) {
              return null
            }

            hideTextSelection = true

            return getNodeRangeDecorations(nodeRanges)
          },
        },
      }),
    ]
  },
})
