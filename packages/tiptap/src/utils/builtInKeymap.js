import { lift, selectParentNode } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { undoInputRule } from 'prosemirror-inputrules'
import isMac from './isMac'

const keymap = {
	'Mod-z': undo,
	'Shift-Mod-z': undo,
	'Mod-BracketLeft': lift,
	Backspace: undoInputRule,
	Escape: selectParentNode,
}

if (!isMac) {
	keymap['Mod-y'] = redo
}

export default keymap
