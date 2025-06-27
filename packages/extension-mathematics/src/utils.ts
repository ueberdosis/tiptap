import type { Editor } from '@tiptap/core'
import type { Transaction } from 'packages/pm/state'

const mathRegex = /(?<!\d)\$(?!\$)(?:[^$\n]|\\\$)*?(?<!\\)\$(?!\d)/g

/**
 * Creates a transaction that migrates existing math strings in the document to new math nodes.
 * This function traverses the document and replaces LaTeX math syntax (wrapped in single dollar signs)
 * with proper inline math nodes, preserving the mathematical content.
 *
 * @param editor - The editor instance containing the schema and configuration
 * @param tr - The transaction to modify with the migration operations
 * @returns The modified transaction with math string replacements
 *
 * @example
 * ```typescript
 * const editor = new Editor({ ... })
 * const tr = editor.state.tr
 * const updatedTr = createMathMigrateTransaction(editor, tr)
 * editor.view.dispatch(updatedTr)
 * ```
 */
export function createMathMigrateTransaction(editor: Editor, tr: Transaction) {
  // we traverse the document and replace all math nodes with the new math nodes
  tr.doc.descendants((node, pos) => {
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
  return tr
}

/**
 * Migrates existing math strings in the editor document to math nodes.
 * This function creates and dispatches a transaction that converts LaTeX math syntax
 * (text wrapped in single dollar signs) into proper inline math nodes. The migration
 * happens immediately and is not added to the editor's history.
 *
 * @param editor - The editor instance to perform the migration on
 *
 * @example
 * ```typescript
 * const editor = new Editor({
 *   extensions: [Mathematics, MathMigration],
 *   content: 'This is inline math: $x^2 + y^2 = z^2$ in text.'
 * })
 *
 * // Math strings will be automatically migrated to math nodes
 * migrateMathStrings(editor)
 * ```
 */
export function migrateMathStrings(editor: Editor) {
  const tr = createMathMigrateTransaction(editor, editor.state.tr)
  editor.view.dispatch(tr)
}
