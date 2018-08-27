import { InputRule } from 'prosemirror-inputrules'

export default function (regexp, markType, getAttrs) {
	return new InputRule(regexp, (state, match, start, end) => {
		let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
		let tr = state.tr

		if (match[1]) {
			const startSpaces = match[0].search(/\S/)
			let textStart = start + match[0].indexOf(match[1])
			let textEnd = textStart + match[1].length
			if (textEnd < end) {
				tr.delete(textEnd, end)
			}
			if (textStart > start) {
				tr.delete(start + startSpaces, textStart)
			}
			end = start + startSpaces + match[1].length
		}

		tr.addMark(start, end, markType.create(attrs))
		tr.removeStoredMark(markType) // Do not continue with mark.
		return tr
	})
}
