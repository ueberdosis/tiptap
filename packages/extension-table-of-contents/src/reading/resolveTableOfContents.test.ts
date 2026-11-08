import type { JSONContent } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Node as PMNode } from '@tiptap/pm/model'
import { describe, expect, it } from 'vite-plus/test'

import { TableOfContents } from '../tableOfContents.js'
import { resolveTableOfContents } from './resolveTableOfContents.js'

const schema = getSchema([Document, Paragraph, Text, Heading, Blockquote, TableOfContents])

const heading = (level: number, text: string, id?: string): JSONContent => ({
  type: 'heading',
  attrs: { level, ...(id ? { 'data-toc-id': id } : {}) },
  content: text ? [{ type: 'text', text }] : undefined,
})

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const createDoc = (...content: JSONContent[]) => PMNode.fromJSON(schema, { type: 'doc', content })

describe('resolveTableOfContents', () => {
  it('reads every heading in document order', () => {
    const doc = createDoc(heading(1, 'One', 'a'), paragraph('Text'), heading(2, 'Two', 'b'))

    expect(resolveTableOfContents(doc)).toEqual([
      { id: 'a', level: 1, depth: 1, textContent: 'One', pos: 0 },
      { id: 'b', level: 2, depth: 2, textContent: 'Two', pos: 11 },
    ])
  })

  it('starts the depth at 1 when the document starts at level 2', () => {
    const doc = createDoc(heading(2, 'Intro'), heading(3, 'Detail'), heading(2, 'Next'))

    expect(resolveTableOfContents(doc).map(entry => entry.depth)).toEqual([1, 2, 1])
  })

  it('returns null for a heading without an id', () => {
    const doc = createDoc(heading(1, 'No id'))

    expect(resolveTableOfContents(doc)[0].id).toBeNull()
  })

  it('skips empty headings', () => {
    const doc = createDoc(heading(1, ''), heading(1, 'Filled'))

    expect(resolveTableOfContents(doc).map(entry => entry.textContent)).toEqual(['Filled'])
  })

  it('finds headings inside other nodes', () => {
    const doc = createDoc({ type: 'blockquote', content: [heading(2, 'Quoted')] })

    expect(resolveTableOfContents(doc).map(entry => entry.textContent)).toEqual(['Quoted'])
  })

  it('reads only the given anchor types', () => {
    const doc = createDoc(heading(1, 'Heading'), paragraph('Paragraph'))

    expect(
      resolveTableOfContents(doc, { anchorTypes: ['paragraph'] }).map(entry => entry.textContent),
    ).toEqual(['Paragraph'])
  })

  it('uses level 1 for anchor types without a level', () => {
    const doc = createDoc(paragraph('First'), paragraph('Second'))

    expect(resolveTableOfContents(doc, { anchorTypes: ['paragraph'] })).toMatchObject([
      { level: 1, depth: 1 },
      { level: 1, depth: 1 },
    ])
  })

  describe('ranges', () => {
    const doc = createDoc(heading(1, 'One'), heading(2, 'Two'), heading(2, 'Three'))
    const [one, two, three] = resolveTableOfContents(doc)

    it('reads only headings fully inside a range', () => {
      const result = resolveTableOfContents(doc, { ranges: [{ from: two.pos, to: three.pos }] })

      expect(result.map(entry => entry.textContent)).toEqual(['Two'])
    })

    it('skips a heading that crosses the edge of a range', () => {
      const result = resolveTableOfContents(doc, { ranges: [{ from: one.pos + 1, to: three.pos }] })

      expect(result.map(entry => entry.textContent)).toEqual(['Two'])
    })

    it('counts depth across several ranges as one outline', () => {
      const result = resolveTableOfContents(doc, {
        ranges: [
          { from: three.pos, to: doc.content.size },
          { from: one.pos, to: two.pos },
        ],
      })

      expect(result).toMatchObject([
        { textContent: 'One', depth: 1 },
        { textContent: 'Three', depth: 2 },
      ])
    })

    it('lists a heading once when ranges overlap', () => {
      const result = resolveTableOfContents(doc, {
        ranges: [
          { from: 0, to: doc.content.size },
          { from: 0, to: doc.content.size },
        ],
      })

      expect(result).toHaveLength(3)
    })

    it('ignores empty ranges and clamps ranges outside the document', () => {
      expect(resolveTableOfContents(doc, { ranges: [{ from: 5, to: 5 }] })).toEqual([])
      expect(resolveTableOfContents(doc, { ranges: [{ from: -10, to: 1000 }] })).toHaveLength(3)
    })
  })
})
