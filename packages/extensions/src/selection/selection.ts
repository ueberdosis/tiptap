import { Extension, isNodeSelection } from '@tiptap/core'
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export type SelectionOptions = {
  /**
   * The class name that should be added to the selected text.
   * @default 'selection'
   * @example 'is-selected'
   */
  className: string
}

/**
 * Checks if the selection should be preserved when the editor is blurred.
 * @param state The editor state.
 * @param editor The editor instance.
 * @returns `true` if the selection should be preserved when the editor is blurred.
 */
function shouldSyncDomSelection(
  state: EditorState,
  editor: {
    isEditable: boolean
  },
): boolean {
  return !state.selection.empty && !isNodeSelection(state.selection) && editor.isEditable
}

function shouldPreserveSelection(
  state: EditorState,
  editor: {
    isEditable: boolean
    isFocused: boolean
    view: EditorView
  },
): boolean {
  return shouldSyncDomSelection(state, editor) && !editor.isFocused && !editor.view.dragging
}

function clearDomSelection() {
  window.getSelection()?.removeAllRanges()
}

function restoreDomSelection(view: EditorView) {
  // Sync the native selection from the editor state (see prosemirror-view `EditorView#focus`).
  view.focus()
}

/**
 * This extension allows you to add a class to the selected text when the editor is blurred.
 * It clears the native browser selection on blur (so `::selection` styles do not overlap the
 * decoration) and restores it when the editor is focused again.
 * @see https://www.tiptap.dev/api/extensions/selection
 */
export const Selection = Extension.create<SelectionOptions>({
  name: 'selection',

  addOptions() {
    return {
      className: 'selection',
    }
  },

  addProseMirrorPlugins() {
    const { editor, options } = this

    return [
      new Plugin({
        key: new PluginKey('selection'),
        props: {
          decorations(state) {
            if (!shouldPreserveSelection(state, editor)) {
              return null
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(state.selection.from, state.selection.to, {
                class: options.className,
              }),
            ])
          },
          handleDOMEvents: {
            blur(view) {
              if (!shouldSyncDomSelection(view.state, editor)) {
                return false
              }

              clearDomSelection()

              return false
            },
            focus(view) {
              if (!shouldSyncDomSelection(view.state, editor)) {
                return false
              }

              requestAnimationFrame(() => {
                if (!editor.isDestroyed && view.hasFocus()) {
                  restoreDomSelection(view)
                }
              })

              return false
            },
          },
        },
      }),
    ]
  },
})

export default Selection
