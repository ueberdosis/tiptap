import { type Editor, Extension } from '@tiptap/core'

/**
 * The math migration extension is used to convert markdown-math syntax into math nodes.
 */
export const MathMigration = Extension.create(() => {
  const mathRegex = /(?<!\d)\$(?!\$)(?:[^$\n]|\\\$)*?(?<!\\)\$(?!\d)/g
  let needsSyncMigration = true

  function convertContent(editor: Editor) {
    if (!editor.state.schema.nodes.inlineMath) {
      return
    }

    const tr = editor.view.state.tr

    // we traverse the document and replace all math nodes with the new math nodes
    editor.view.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text || !node.text.includes('$')) {
        return
      }

      const { text } = node

      const match = node.text.match(mathRegex)
      if (!match) {
        return
      }

      match.forEach(mathMatch => {
        const start = text.indexOf(mathMatch)
        const end = start + mathMatch.length

        // Replace the math syntax with a new math node
        tr.replaceWith(
          tr.mapping.map(pos + start),
          tr.mapping.map(pos + end),
          editor.schema.nodes.inlineMath.create({ latex: mathMatch.slice(1, -1) }),
        )
      })
    })

    // don't add to history
    tr.setMeta('addToHistory', false)
    editor.view.dispatch(tr)
  }

  return {
    name: 'math-migration',

    onCreate() {
      convertContent(this.editor)
    },

    onUpdate({ transaction }) {
      // we want to convert the content only if the transaction has changed
      if (transaction.docChanged && transaction.getMeta('y-sync') && needsSyncMigration) {
        convertContent(this.editor)
        needsSyncMigration = false
      }
    },
  }
})
