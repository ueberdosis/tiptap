import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import { Transform } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vitest'

import { getChangedRanges } from '../getChangedRanges.js'

/** "<p>hello world</p>" 0=doc, 1=<p>, 2..12="hello world", 13=</p>. */
function createDoc(): Node {
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

  it('no-position fallback branch: DocAttrStep produces no changed ranges', () => {
    const doc = createDoc()
    const transform = new Transform(doc)

    // DocAttrStep has no from/to/pos, so the loop returns early for this step.
    transform.setDocAttribute('title', 'demo')

    expect(getChangedRanges(transform)).toEqual([])
  })
})
