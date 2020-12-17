import { Node } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import { Fragment } from 'prosemirror-model'
import SuggestionsPlugin from '../plugins/Suggestions'

export default class Mention extends Node {

  get name() {
    return 'mention'
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '@',
        allowSpaces: false,
        startOfLine: false,
      },
      mentionClass: 'mention',
      suggestionClass: 'mention-suggestion',
    }
  }

  getLabel(dom) {
    return dom.innerText.split(this.options.matcher.char).join('')
  }

  createFragment(schema, label) {
    return Fragment.fromJSON(schema, [{ type: 'text', text: `${this.options.matcher.char}${label}` }])
  }

  insertMention(range, attrs, schema) {
    const nodeType = schema.nodes[this.name]
    const nodeFragment = this.createFragment(schema, attrs.label)
    return replaceText(range, nodeType, attrs, nodeFragment)
  }

  get schema() {
    return {
      attrs: {
        id: {},
        label: {},
      },
      group: 'inline',
      inline: true,
      content: 'text*',
      selectable: false,
      atom: true,
      toDOM: node => [
        'span',
        {
          class: this.options.mentionClass,
          'data-mention-id': node.attrs.id,
        },
        `${this.options.matcher.char}${node.attrs.label}`,
      ],
      parseDOM: [
        {
          tag: 'span[data-mention-id]',
          getAttrs: dom => {
            const id = dom.getAttribute('data-mention-id')
            const label = this.getLabel(dom)
            return { id, label }
          },
          getContent: (dom, schema) => {
            const label = this.getLabel(dom)
            return this.createFragment(schema, label)
          },
        },
      ],
    }
  }

  commands({ schema }) {
    return attrs => this.insertMention(null, attrs, schema)
  }

  get plugins() {
    return [
      SuggestionsPlugin({
        command: ({ range, attrs, schema }) => this.insertMention(range, attrs, schema),
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
