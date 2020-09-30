import { Command, Node } from '@tiptap/core'
import { textblockTypeInputRule } from 'prosemirror-inputrules'

export type CodeBlockCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    codeBlock: CodeBlockCommand,
  }
}

export const inputRegex = /^```(?<language>[a-z]*)? $/

export default new Node()
  .name('code_block')
  .schema(() => ({
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
        getAttrs(dom) {
          const code = (dom as HTMLElement).firstChild

          if (!code) {
            return null
          }

          const classAttribute = ((code as HTMLElement).getAttribute('class') as string)

          if (!classAttribute) {
            return null
          }

          return { language: classAttribute.replace(/^(language-)/, '') }
        },
      },
    ],
    toDOM: node => ['pre', ['code', { class: node.attrs.language && `language-${node.attrs.language}` }, 0]],
  }))
  .commands(({ name }) => ({
    codeBlock: attrs => ({ commands }) => {
      return commands.toggleBlockType(name, 'paragraph', attrs)
    },
  }))
  .keys(({ editor }) => ({
    'Shift-Control-\\': () => editor.codeBlock(),
  }))
  .inputRules(({ type }) => [
    textblockTypeInputRule(inputRegex, type, ({ groups }: any) => groups),
  ])
  .create()
