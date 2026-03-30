import { Plugin, PluginKey } from '@tiptap/pm/state'

import type { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'

// When dragging across editors, store the source editor globally so that
// we can choose to delete the source content when dropped.
let dragSourceEditor: Editor | null = null

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
            drop: () => {
              if (dragSourceEditor !== null && dragSourceEditor !== editor && dragSourceEditor.isEditable) {
                const dragSourceEditorCopy = dragSourceEditor

                // setTimeout to avoid the wrong content after drop, timeout arg can't be empty or 0
                setTimeout(() => {
                  const selection = dragSourceEditorCopy.state.selection

                  if (selection) {
                    dragSourceEditorCopy.commands.deleteRange({ from: selection.from, to: selection.to })
                  }
                }, 10)
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
