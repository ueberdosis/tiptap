import { Extension, isNodeSelection } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
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
 * This extension allows you to add a class to the selected text.
 * @see https://www.tiptap.dev/api/extensions/selection
 */
export const Selection = Extension.create({
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
            if (
              state.selection.empty ||
              editor.isFocused ||
              !editor.isEditable ||
              isNodeSelection(state.selection) ||
              editor.view.dragging
            ) {
              return null
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(state.selection.from, state.selection.to, {
                class: options.className,
              }),
            ])
          },
        },
      }),
    ]
  },
})

export default Selection
