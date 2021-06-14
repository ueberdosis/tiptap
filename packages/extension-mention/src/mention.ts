import { Node, mergeAttributes } from '@tiptap/core'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'

export type MentionOptions = {
  HTMLAttributes: Record<string, any>,
  renderLabel: (props: {
    options: MentionOptions,
    node: ProseMirrorNode,
  }) => string,
  suggestion: Omit<SuggestionOptions, 'editor'>,
}

export const Mention = Node.create<MentionOptions>({
  name: 'mention',

  defaultOptions: {
    HTMLAttributes: {},
    renderLabel({ options, node }) {
      return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
    },
    suggestion: {
      char: '@',
      command: ({ editor, range, props }) => {
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'mention',
              attrs: props,
            },
            {
              type: 'text',
              text: ' ',
            },
          ])
          .run()
      },
      allow: ({ editor, range }) => {
        return editor.can().insertContentAt(range, { type: 'mention' })
      },
    },
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => {
          return {
            id: element.getAttribute('data-id'),
          }
        },
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }

          return {
            'data-id': attributes.id,
          }
        },
      },

      label: {
        default: null,
        parseHTML: element => {
          return {
            label: element.getAttribute('data-label'),
          }
        },
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }

          return {
            'data-label': attributes.label,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-mention]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      this.options.renderLabel({
        options: this.options,
        node,
      }),
    ]
  },

  renderText({ node }) {
    return this.options.renderLabel({
      options: this.options,
      node,
    })
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => this.editor.commands.command(({ tr, state }) => {
        let isMention = false
        const { selection } = state
        const { empty, anchor } = selection

        if (!empty) {
          return false
        }

        state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
          if (node.type.name === this.name) {
            isMention = true
            tr.insertText(this.options.suggestion.char || '', pos, pos + node.nodeSize)

            return false
          }
        })

        return isMention
      }),
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
