import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { Transform } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vite-plus/test'

import { getChangedRanges } from './getChangedRanges.js'

/** "<p>hello world</p>" 0=doc, 1=<p>, 2..12="hello world", 13=</p>. */
function createDoc(): PMNode {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, Bold],
    content: '<p>hello world</p>',
  })
  const doc = editor.state.doc
  editor.destroy()

  return doc
}

describe('getChangedRanges', () => {
  it('from/to branch: AddMarkStep yields a changed range covering the marked text', () => {
    const doc = createDoc()
    const transform = new Transform(doc)

    // AddMarkStep carries from/to but its StepMap has no ranges.
    transform.addMark(2, 7, doc.type.schema.marks.bold.create())

    const changes = getChangedRanges(transform)

    expect(changes).toHaveLength(1)
    expect(changes[0].newRange).toEqual({ from: 2, to: 7 })
    expect(changes[0].oldRange).toEqual({ from: 2, to: 7 })
  })

  it('multiple steps: each range is mapped through later steps and back to the original doc', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold],
      content: '<p>hello world</p><p>second paragraph here</p>',
    })
    const doc = editor.state.doc
    const { schema } = doc.type
    editor.destroy()

    const transform = new Transform(doc)

    transform.insert(3, schema.text('abc'))
    transform.delete(8, 11)
    transform.addMark(2, 6, schema.marks.bold.create())
    transform.insert(20, schema.text('xyz'))
    transform.replaceWith(1, 4, schema.text('Q'))

    expect(getChangedRanges(transform)).toEqual([
      { oldRange: { from: 1, to: 3 }, newRange: { from: 1, to: 4 } },
      { oldRange: { from: 5, to: 8 }, newRange: { from: 6, to: 6 } },
      { oldRange: { from: 20, to: 20 }, newRange: { from: 18, to: 21 } },
    ])
  })

  it('many steps: contained ranges collapse to one', () => {
    const doc = createDoc()
    const transform = new Transform(doc)

    for (let index = 0; index < 200; index += 1) {
      transform.insert(2 + index, doc.type.schema.text('a'))
    }

    expect(getChangedRanges(transform)).toEqual([
      { oldRange: { from: 2, to: 2 }, newRange: { from: 2, to: 202 } },
    ])
  })

  it('no-position fallback branch: DocAttrStep produces no changed ranges', () => {
    const doc = createDoc()
    const transform = new Transform(doc)

    // DocAttrStep has no from/to/pos, so the loop returns early for this step.
    transform.setDocAttribute('title', 'demo')

    expect(getChangedRanges(transform)).toEqual([])
  })
})
