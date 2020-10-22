import { Command, createNode } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export interface CodeBlockOptions {
  languageClassPrefix: string,
}

// export type CodeBlockCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     codeBlock: CodeBlockCommand,
//   }
// }

export const backtickInputRegex = /^```(?<language>[a-z]*)? $/
export const tildeInputRegex = /^~~~(?<language>[a-z]*)? $/

export default createNode({
  name: 'code_block',

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
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: node => {
          const classAttribute = (node as Element).firstElementChild?.getAttribute('class')

          if (!classAttribute) {
            return null
          }

          const regexLanguageClassPrefix = new RegExp(`^(${this.options.languageClassPrefix})`)

          return { language: classAttribute.replace(regexLanguageClassPrefix, '') }
        },
      },
    ]
  },

  renderHTML({ node, attributes }) {
    return ['pre', attributes, ['code', {
      class: node.attrs.language && this.options.languageClassPrefix + node.attrs.language,
    }, 0]]
  },

  addCommands() {
    return {
      codeBlock: attrs => ({ commands }) => {
        return commands.toggleBlockType('code_block', 'paragraph', attrs)
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
