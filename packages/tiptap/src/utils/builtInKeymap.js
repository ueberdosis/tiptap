import { lift, selectParentNode } from 'prosemirror-commands'
import { undoInputRule } from 'prosemirror-inputrules'

const keymap = {
	'Mod-BracketLeft': lift,
	Backspace: undoInputRule,
	Escape: selectParentNode,
}

export default keymap
