import { Extension } from 'tiptap'
import { history, undo, redo } from 'prosemirror-history'

export default class HistoryExtension extends Extension {

	get name() {
		return 'history'
	}

	keys() {
		const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false
		const keymap = {
			'Mod-z': undo,
			'Shift-Mod-z': redo,
		}

		if (!isMac) {
			keymap['Mod-y'] = redo
		}

		return keymap
	}

	get plugins() {
		return [
			history(),
		]
	}

}
