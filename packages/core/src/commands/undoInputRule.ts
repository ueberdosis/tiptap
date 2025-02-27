import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    undoInputRule: {
      /**
       * Undo an input rule.
       * @example editor.commands.undoInputRule()
       */
      undoInputRule: () => ReturnType
    }
  }
}

export const undoInputRule: RawCommands['undoInputRule'] =
  () =>
  ({ state, dispatch }) => {
    const plugins = state.plugins

    for (let i = 0; i < plugins.length; i += 1) {
      const plugin = plugins[i]
      let undoable

      // @ts-ignore
      // eslint-disable-next-line
      if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
        if (dispatch) {
          const tr = state.tr
          const toUndo = undoable.transform

          for (let j = toUndo.steps.length - 1; j >= 0; j -= 1) {
            tr.step(toUndo.steps[j].invert(toUndo.docs[j]))
          }

          if (undoable.text) {
            const marks = tr.doc.resolve(undoable.from).marks()

            tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks))
          } else {
            tr.delete(undoable.from, undoable.to)
          }
        }

        return true
      }
    }

    return false
  }
