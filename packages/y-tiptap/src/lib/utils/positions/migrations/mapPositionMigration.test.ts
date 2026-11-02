import { Node } from 'prosemirror-model'
import { describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'
import { createTestView } from '../../../../../tests/utils/createTestView.js'
import { schema } from '../../../../../tests/utils/testSchema.js'

describe('mapPositionMigration', () => {
  it('does not walk the document for each step when no tracked position is deleted', () => {
    const document = new Y.Doc()
    const view = createTestView(document)
    const paragraphs = Array.from({ length: 20 }, (_, index) =>
      schema.node('paragraph', null, schema.text(`Paragraph ${index}`)),
    )
    view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, paragraphs))

    const transaction = view.state.tr
    for (let index = 0; index < 10; index += 1) {
      transaction.split(4 + index * 2)
    }
    const descendants = vi.spyOn(Node.prototype, 'descendants')
    view.dispatch(transaction)

    expect(descendants).not.toHaveBeenCalled()
    descendants.mockRestore()
    expect(view.state.doc.childCount).toBe(30)

    view.destroy()
    document.destroy()
  })
})
