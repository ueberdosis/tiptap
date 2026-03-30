import { Plugin, PluginKey } from '@tiptap/pm/state'
import { type EditorView } from '@tiptap/pm/view'

import type { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'
import { isiOS } from '../utilities/isiOS.js'
import { isMacOS } from '../utilities/isMacOS.js'

// When dragging across editors, store the source editor globally so that
// we can choose to delete the source content when dropped.
let dragSourceEditor: Editor | null = null

// Copy dragMoves function from prosemirror-view (not exported) so that we make the same
// choice that ProseMirror does when dragging within a single editor.
// Based on https://github.com/ProseMirror/prosemirror-view/blob/5bcfa0ebd4cff7f13c936bcde6d39b4d7df22b75/src/input.ts#L673
const dragCopyModifier: keyof DragEvent = isiOS() || isMacOS() ? 'altKey' : 'ctrlKey'
function dragMoves(view: EditorView, event: DragEvent) {
  // @ts-expect-error dragCopies is not in our list of props
  const moves = view.someProp('dragCopies', test => !test(event))
  return moves != null ? moves : !event[dragCopyModifier]
}

export const Drop = Extension.create({
  name: 'drop',

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey('tiptapDrop'),

        // we register a global drag handler to track the current drag source editor
        view(view) {
          const handleDragstart = (event: DragEvent) => {
            if (view.dom.parentElement?.contains(event.target as Element)) {
              dragSourceEditor = editor
            }
          }

          const handleDragend = () => {
            dragSourceEditor = null
          }

          window.addEventListener('dragstart', handleDragstart)
          window.addEventListener('dragend', handleDragend)

          return {
            destroy() {
              window.removeEventListener('dragstart', handleDragstart)
              window.removeEventListener('dragend', handleDragend)
            },
          }
        },

        props: {
          handleDOMEvents: {
            drop: (_view, event) => {
              if (dragSourceEditor !== null && dragSourceEditor !== editor && dragSourceEditor.isEditable) {
                // Call dragMove on the source editor, since it is the one affected by this decision.
                const move = dragMoves(dragSourceEditor.view, event)

                if (move) {
                  // setTimeout to avoid the wrong content after drop, timeout arg can't be empty or 0
                  const dragSourceEditorCopy = dragSourceEditor
                  setTimeout(() => {
                    const selection = dragSourceEditorCopy.state.selection

                    if (selection) {
                      dragSourceEditorCopy.commands.deleteRange({ from: selection.from, to: selection.to })
                    }
                  }, 10)
                }
              }
              return false
            },
          },

          handleDrop: (_, e, slice, moved) => {
            this.editor.emit('drop', {
              editor: this.editor,
              event: e,
              slice,
              moved,
            })
          },
        },
      }),
    ]
  },
})
