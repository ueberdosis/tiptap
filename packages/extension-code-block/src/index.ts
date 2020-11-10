import { Command, createNode } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export interface CodeBlockOptions {
  languageClassPrefix: string,
}

export const backtickInputRegex = /^```(?<language>[a-z]*)? $/
export const tildeInputRegex = /^~~~(?<language>[a-z]*)? $/

const CodeBlock = createNode({
  name: 'codeBlock',

  defaultOptions: <CodeBlockOptions>{
    languageClassPrefix: 'language-',
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

  renderHTML({ attributes }) {
    return ['pre', ['code', attributes, 0]]
  },

  addCommands() {
    return {
      codeBlock: (attrs?: CodeBlockOptions): Command => ({ commands }) => {
        return commands.toggleBlockType('codeBlock', 'paragraph', attrs)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.codeBlock(),
    }
  },

  addInputRules() {
    return [
      textblockTypeInputRule(backtickInputRegex, this.type, ({ groups }: any) => groups),
      textblockTypeInputRule(tildeInputRegex, this.type, ({ groups }: any) => groups),
    ]
  },
})

export default CodeBlock

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    CodeBlock: typeof CodeBlock,
  }
}
