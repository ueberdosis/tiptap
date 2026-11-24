import type { Transaction } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import { ReplaceStep } from 'prosemirror-transform'

/** Reports whether a transaction changes the document structure. */
export const isStructuralTransaction = (tr: Transaction, oldDoc: Node) => {
  if (!tr.docChanged) {
    return false
  }
  if (tr.doc.childCount !== oldDoc.childCount) {
    return true
  }
  for (const step of tr.steps) {
    if (step instanceof ReplaceStep) {
      if (step.from === 0 && step.to === oldDoc.content.size) {
        return true
      }
      if (step.slice.content.size > 0) {
        let hasBlock = false
        step.slice.content.forEach(node => {
          if (node.isBlock) {
            hasBlock = true
          }
        })
        if (hasBlock) {
          return true
        }
      } else if (step.to > step.from) {
        const $from = oldDoc.resolve(step.from)
        const $to = oldDoc.resolve(step.to)
        if ($from.depth === 0 && $to.depth === 0 && $from.index() !== $to.index()) {
          return true
        }
      }
    }
  }
  return false
}
