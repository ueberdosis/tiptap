import { Plugin, PluginKey } from '@tiptap/pm/state'

import type { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'

let dragFromOtherEditor: Editor | null = null

export const Drop = Extension.create({
  name: 'drop',

  addProseMirrorPlugins() {
    const editor = this.editor
    let dragSourceParent: HTMLElement | null = null

    return [
      new Plugin({
        key: new PluginKey('tiptapDrop'),

        view(view) {
          const handleDragstart = (event: DragEvent) => {
            dragSourceParent = view.dom.parentElement?.contains(event.target as Element)
              ? view.dom.parentElement
              : null

            if (dragSourceParent) {
              dragFromOtherEditor = editor
            }
          }

          const handleDragend = () => {
            if (dragFromOtherEditor) {
              dragFromOtherEditor = null
            }
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
            drop: view => {
              const isDroppedFromSameEditor = dragSourceParent === view.dom.parentElement

              if (!isDroppedFromSameEditor) {
                const sourceEditor = dragFromOtherEditor

                if (sourceEditor?.isEditable && editor.options.crossEditorDrop === 'move') {
                  setTimeout(() => {
                    const { selection } = sourceEditor.state

                    if (selection) {
                      sourceEditor.commands.deleteRange({ from: selection.from, to: selection.to })
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
