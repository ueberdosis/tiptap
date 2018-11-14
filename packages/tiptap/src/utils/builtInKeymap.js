import { selectParentNode } from 'prosemirror-commands'
import { undoInputRule } from 'prosemirror-inputrules'

const keymap = {
  Backspace: undoInputRule,
  Escape: selectParentNode,
}

export default keymap
