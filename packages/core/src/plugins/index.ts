import { undoInputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import editable from './editable'
import focus from './focus'

export default [
  () => dropCursor(),
  () => gapCursor(),
  () => keymap({ Backspace: undoInputRule }),
  () => keymap(baseKeymap),
  editable,
  focus,
]