import { EditorState, Transaction } from 'prosemirror-state'

// source: https://github.com/ProseMirror/prosemirror-inputrules/blob/2d3ae3abe3428a1b4d343808915aafeff8563371/src/inputrules.js#L101
export default function undoInputRule(state: EditorState, dispatch?: (tr: Transaction<any>) => void) {
  let plugins = state.plugins

  for (let i = 0; i < plugins.length; i++) {
    let plugin = plugins[i], undoable
    // @ts-ignore
    if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
      if (dispatch) {
        let tr = state.tr, toUndo = undoable.transform

        for (let j = toUndo.steps.length - 1; j >= 0; j--) {
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]))
        }

        let marks = tr.doc.resolve(undoable.from).marks()

        if (!undoable.text) {
          return false
        }

        dispatch(tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks)))
      }

      return true
    }
  }

  return false
}