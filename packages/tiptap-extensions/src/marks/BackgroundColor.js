import { Mark } from 'tiptap'
import { updateMark } from 'tiptap-commands'

export default class BackgroundColor extends Mark {
    get name () {
        return 'background_color'
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
                    default: 'rgba(255,255,255,0)'
                },
            },
            inline: true,
            parseDOM: [
                {
                    style: 'background-color',
                    getAttrs: (value) => ({ color: value }),
                }, {
                    style: 'background',
                    getAttrs: (value) => ({ color: value }),
                },
            ],
            toDOM: mark => [
                "span",
                { style: `background-color: ${mark.attrs.color}` },
                0
            ]
        }
    }

    commands ({ type }) {
        return (attrs) => updateMark(type, attrs)
    }
}
