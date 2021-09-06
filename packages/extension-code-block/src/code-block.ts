import { Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export interface CodeBlockOptions {
  languageClassPrefix: string,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType,
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType,
    }
  }
}

export const backtickInputRegex = /^```(?<language>[a-z]*)? $/
export const tildeInputRegex = /^~~~(?<language>[a-z]*)? $/

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  defaultOptions: {
    languageClassPrefix: 'language-',
    HTMLAttributes: {},
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: element => {
          const classAttributes = element.firstElementChild?.classList
          const regexLanguageClassPrefix = new RegExp(`^(${this.options.languageClassPrefix})`)

          let language = null
          for (const attribute of classAttributes) {
            if (attribute.startsWith(this.options.languageClassPrefix)) {
              language = attribute.replace(regexLanguageClassPrefix, '')
              break
            }
          }
          if (!language) {
            return null
          }
          return {
            language
          };
        },
        renderHTML: attributes => {
          if (!attributes.language) {
            return null
          }

          return {
            class: this.options.languageClassPrefix + attributes.language,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', this.options.HTMLAttributes, ['code', HTMLAttributes, 0]]
  },

  addCommands() {
    return {
      setCodeBlock: attributes => ({ commands }) => {
        return commands.setNode('codeBlock', attributes)
      },
      toggleCodeBlock: attributes => ({ commands }) => {
        return commands.toggleNode('codeBlock', 'paragraph', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),

      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === 1

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes()
        }

        return false
      },
    }
  },

  addInputRules() {
    return [
      textblockTypeInputRule(backtickInputRegex, this.type, ({ groups }: any) => groups),
      textblockTypeInputRule(tildeInputRegex, this.type, ({ groups }: any) => groups),
    ]
  },
})
