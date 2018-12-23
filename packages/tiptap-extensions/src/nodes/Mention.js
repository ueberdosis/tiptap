import { Node } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import SuggestionsPlugin from '../plugins/Suggestions'

export default class Mention extends Node {

  get name() {
    return this.options.type === 'default' ? 'mention' : `mention_${this.options.type}`
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '@',
        allowSpaces: false,
        startOfLine: false,
      },
      type: 'default',
      mentionClass: 'mention',
      suggestionClass: 'mention-suggestion',
    }
  }

  get schema() {
    return {
      attrs: {
        id: {},
        label: {},
      },
      group: 'inline',
      inline: true,
      selectable: false,
      atom: true,
      toDOM: node => [
        'span',
        {
          class: this.options.mentionClass,
          'data-mention-id': node.attrs.id,
          'data-mention-type': this.options.type,
        },
        `${this.options.matcher.char}${node.attrs.label}`,
      ],
      parseDOM: [
        {
          type: `span[data-mention-type=${this.options.type}]`,
          getAttrs: dom => {
            const id = dom.getAttribute('data-mention-id')
            const type = dom.getAttribute('data-mention-type')
            const label = dom.innerText.split(this.options.matcher.char).join('')
            return { id, label, type }
          },
        },
      ],
    }
  }

  commands({ schema }) {
    return attrs => replaceText(null, schema.nodes[this.name], attrs)
  }

  get plugins() {
    return [
      SuggestionsPlugin({
        command: ({ range, attrs, schema }) => replaceText(range, schema.nodes[this.name], attrs),
        appendText: ' ',
        matcher: this.options.matcher,
        items: this.options.items,
        onEnter: this.options.onEnter,
        onChange: this.options.onChange,
        onExit: this.options.onExit,
        onKeyDown: this.options.onKeyDown,
        onFilter: this.options.onFilter,
        suggestionClass: this.options.suggestionClass,
      }),
    ]
  }

}
