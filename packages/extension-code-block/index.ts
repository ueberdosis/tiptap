import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export interface CodeBlockOptions {
  languageClassPrefix: string,
}

export type CodeBlockCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    codeBlock: CodeBlockCommand,
  }
}

export const backtickInputRegex = /^```(?<language>[a-z]*)? $/
export const tildeInputRegex = /^~~~(?<language>[a-z]*)? $/

export default new Node<CodeBlockOptions>()
  .name('code_block')
  .defaults({
    languageClassPrefix: 'language-',
  })
  .schema(({ options }) => ({
    attrs: {
      language: {
        default: null,
      },
    },
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    draggable: false,
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs(node) {
          const classAttribute = (node as Element).firstElementChild?.getAttribute('class')

          if (!classAttribute) {
            return null
          }

          const regexLanguageClassPrefix = new RegExp(`^(${options.languageClassPrefix})`)

          return { language: classAttribute.replace(regexLanguageClassPrefix, '') }
        },
      },
    ],
    toDOM: node => ['pre', ['code', {
      class: node.attrs.language && options.languageClassPrefix + node.attrs.language,
    }, 0]],
  }))
  .commands(({ name }) => ({
    codeBlock: attrs => ({ commands }) => {
      return commands.toggleBlockType(name, 'paragraph', attrs)
    },
  }))
  .keys(({ editor }) => ({
    'Mod-Shift-c': () => editor.codeBlock(),
  }))
  .inputRules(({ type }) => [
    textblockTypeInputRule(backtickInputRegex, type, ({ groups }: any) => groups),
    textblockTypeInputRule(tildeInputRegex, type, ({ groups }: any) => groups),
  ])
  .create()
