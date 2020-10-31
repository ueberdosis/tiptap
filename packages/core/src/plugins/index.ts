import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { undoInputRule } from 'prosemirror-inputrules'
import editable from './editable'
import focus from './focus'

export default [
  () => keymap({ Backspace: undoInputRule }),
  () => keymap(baseKeymap),
  editable,
  focus,
]
