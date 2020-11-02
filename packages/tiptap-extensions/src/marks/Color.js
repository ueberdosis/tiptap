import { Mark } from 'tiptap'
import { updateMark } from 'tiptap-commands'

export default class Color extends Mark {
    get name () {
        return 'color'
    }

    get defaultOptions () {
        return {
            colors: ['red', 'blue', 'yellow'],
        }
    }

    get schema () {
        return {
            attrs: {
                color: {
                    default: 'rgba(0, 0, 0, 1)'
                },
            },
            inline: true,
            parseDOM: [ {
                    style: 'color',
                    getAttrs: (value) => ({ color: value })
                } ],
            toDOM: mark => [
                "span",
                { style: `color: ${mark.attrs.color}` },
                0
            ]
        }
    }

    commands ({ type }) {
        return (attrs) => updateMark(type, attrs)
    }
}