import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export interface CodeBlockOptions {
  languageClassPrefix: string,
  HTMLAttributes: {
    [key: string]: any
  },
}

export const backtickInputRegex = /^```(?<language>[a-z]*)? $/
export const tildeInputRegex = /^~~~(?<language>[a-z]*)? $/

export const CodeBlock = Node.create({
  name: 'codeBlock',

  defaultOptions: <CodeBlockOptions>{
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
          const classAttribute = element.firstElementChild?.getAttribute('class')

          if (!classAttribute) {
            return null
          }

          const regexLanguageClassPrefix = new RegExp(`^(${this.options.languageClassPrefix})`)

          return {
            language: classAttribute.replace(regexLanguageClassPrefix, ''),
          }
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
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }): Command => ({ commands }) => {
        return commands.setNode('codeBlock', attributes)
      },
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }): Command => ({ commands }) => {
        return commands.toggleNode('codeBlock', 'paragraph', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
    }
  },

  addInputRules() {
    return [
      textblockTypeInputRule(backtickInputRegex, this.type, ({ groups }: any) => groups),
      textblockTypeInputRule(tildeInputRegex, this.type, ({ groups }: any) => groups),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    CodeBlock: typeof CodeBlock,
  }
}
