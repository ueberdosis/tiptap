import type { NodeType } from '@dibdab/pm/model'
import { Plugin, PluginKey } from '@dibdab/pm/state'
import { v4 as uuidv4 } from 'uuid'

export const TableOfContentsPlugin = ({
  getId,
  anchorTypes = ['heading'],
}: {
  getId?: (textContent: string) => string
  anchorTypes?: Array<string | NodeType>
}) => {
  return new Plugin({
    key: new PluginKey('tableOfContent'),

    appendTransaction(transactions, _oldState, newState) {
      // Avoid running on the server where `window` / DOM is not available.
      if (typeof window === 'undefined') {
        return null
      }

      // Skip updating table of contents during IME composition
      // to avoid interfering with input method editor
      if (transactions.some(tr => tr.getMeta('composition'))) {
        return
      }

      const tr = newState.tr
      let modified = false

      if (transactions.some(transaction => transaction.docChanged)) {
        const existingIds: string[] = []

        newState.doc.descendants((node, pos) => {
          const nodeId = node.attrs['data-toc-id']

          if (!anchorTypes.includes(node.type.name) || node.textContent.length === 0) {
            return
          }

          if (nodeId === null || nodeId === undefined || existingIds.includes(nodeId)) {
            let id = ''

            if (getId) {
              id = getId(node.textContent)
            } else {
              id = uuidv4()
            }

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              'data-toc-id': id,
              id,
            })

            modified = true
          }

          existingIds.push(nodeId)
        })
      }

      return modified ? tr : null
    },
  })
}
