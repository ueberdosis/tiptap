import type { Codemod, Edit } from 'codemod:ast-grep'
import type JSON from 'codemod:ast-grep/langs/json'
import type JS from 'codemod:ast-grep/langs/javascript'
import type TS from 'codemod:ast-grep/langs/typescript'
import type TSX from 'codemod:ast-grep/langs/tsx'

const packageSpecifiers = new Map([
  ["'@tiptap/vue-3'", "'@tiptap/vue'"],
  ['"@tiptap/vue-3"', '"@tiptap/vue"'],
  ["'@tiptap/extension-drag-handle-vue-3'", "'@tiptap/extension-drag-handle-vue'"],
  ['"@tiptap/extension-drag-handle-vue-3"', '"@tiptap/extension-drag-handle-vue"'],
])

type Language = JS | TS | TSX | JSON

const codemod: Codemod<Language> = async root => {
  const edits: Edit[] = []

  root
    .root()
    .findAll({ rule: { kind: 'string' } })
    .forEach(node => {
      const replacement = packageSpecifiers.get(node.text())

      if (replacement) {
        edits.push(node.replace(replacement))
      }
    })

  return edits.length > 0 ? root.root().commitEdits(edits) : null
}

export default codemod
