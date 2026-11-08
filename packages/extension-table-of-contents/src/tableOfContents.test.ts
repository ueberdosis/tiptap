import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Transaction } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { TableOfContents } from './tableOfContents.js'

describe('TableOfContents', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('refreshes anchor DOM references after remount without a content change', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text, Heading, TableOfContents],
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1, id: 'intro', 'data-toc-id': 'intro' },
            content: [{ type: 'text', text: 'Intro' }],
          },
        ],
      },
    })

    const originalAnchor = editor.storage.tableOfContents.anchors[0]
    const doc = editor.state.doc

    editor.unmount()
    editor.mount(document.createElement('div'))

    expect(editor.state.doc).toBe(doc)
    expect(editor.storage.tableOfContents.anchors[0]).not.toBe(originalAnchor)
    expect(editor.storage.tableOfContents.anchors[0]).toBe(editor.view.dom.querySelector('h1'))
  })

  const heading = (level: number, text: string, id?: string) => ({
    type: 'heading',
    attrs: id ? { level, id, 'data-toc-id': id } : { level },
    content: [{ type: 'text', text }],
  })

  // `create` fires in a timeout after the constructor returns
  const createEditor = async (
    content: ReturnType<typeof heading>[],
    onTransaction?: (transaction: Transaction) => void,
  ) => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text, Heading, TableOfContents],
      content: { type: 'doc', content },
      onTransaction: ({ transaction }) => onTransaction?.(transaction),
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    return editor
  }

  it('marks its storage update with the toc meta', async () => {
    const instance = await createEditor([heading(1, 'One'), heading(2, 'Two')])
    const metas: unknown[] = []

    instance.on('transaction', ({ transaction }) => {
      const meta = transaction.getMeta('toc')

      if (meta !== undefined) {
        metas.push(meta)
      }
    })

    instance.commands.insertContentAt(instance.state.doc.content.size - 1, ' and more')

    expect(metas).toHaveLength(1)
  })

  it('dispatches only the storage update on create when every heading has an id', async () => {
    const transactions: Transaction[] = []

    await createEditor([heading(1, 'One', 'one')], transaction => transactions.push(transaction))

    expect(transactions.filter(transaction => !transaction.getMeta('toc'))).toEqual([])
  })

  it('assigns ids on create to headings without one', async () => {
    const instance = await createEditor([heading(1, 'One'), heading(2, 'Two')])
    const ids: unknown[] = []

    instance.state.doc.descendants(node => {
      if (node.type.name === 'heading') {
        ids.push(node.attrs['data-toc-id'])
      }
    })

    expect(ids.every(id => typeof id === 'string' && id.length > 0)).toBe(true)
    expect(new Set(ids).size).toBe(2)
  })
})
