import type { JSONContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { generateTocIds, TableOfContents } from '../src/index.js'

const baseExtensions = [Document, Paragraph, Text, Heading]

const docWithHeadings = (...texts: string[]): JSONContent => ({
  type: 'doc',
  content: texts.map(text => ({
    type: 'heading',
    attrs: { level: 1 },
    content: [{ type: 'text', text }],
  })),
})

describe('generateTocIds', () => {
  it('throws when TableOfContents extension is missing', () => {
    expect(() => generateTocIds(docWithHeadings('a'), baseExtensions)).toThrow(
      'TableOfContents extension (name: "tableOfContents") not found in the extensions array',
    )
  })

  it('accepts a custom extension name for users who extend TableOfContents', () => {
    const CustomToc = TableOfContents.extend({ name: 'myCustomToc' })
    const result = generateTocIds(docWithHeadings('Intro'), [...baseExtensions, CustomToc], 'myCustomToc')
    const heading = result.content?.[0]

    expect(heading?.attrs?.id).toEqual(expect.any(String))
    expect(heading?.attrs?.['data-toc-id']).toEqual(expect.any(String))
  })

  it('reports the requested name in the not-found error when a custom name is missing', () => {
    expect(() => generateTocIds(docWithHeadings('a'), baseExtensions, 'myCustomToc')).toThrow(
      'TableOfContents extension (name: "myCustomToc") not found in the extensions array',
    )
  })

  it('assigns id and data-toc-id to anchor nodes that have none', () => {
    const result = generateTocIds(docWithHeadings('Intro'), [...baseExtensions, TableOfContents])
    const heading = result.content?.[0]

    expect(heading?.attrs?.id).toEqual(expect.any(String))
    expect(heading?.attrs?.['data-toc-id']).toEqual(expect.any(String))
    expect(heading?.attrs?.id).toBe(heading?.attrs?.['data-toc-id'])
  })

  it('skips anchor nodes with empty text content', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 } }],
    }
    const result = generateTocIds(doc, [...baseExtensions, TableOfContents])
    const heading = result.content?.[0]

    expect(heading?.attrs?.id).toBeFalsy()
    expect(heading?.attrs?.['data-toc-id']).toBeFalsy()
  })

  it('preserves unique existing data-toc-id values', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, id: 'existing', 'data-toc-id': 'existing' },
          content: [{ type: 'text', text: 'Intro' }],
        },
      ],
    }
    const result = generateTocIds(doc, [...baseExtensions, TableOfContents])

    expect(result.content?.[0].attrs?.['data-toc-id']).toBe('existing')
    expect(result.content?.[0].attrs?.id).toBe('existing')
  })

  it('regenerates ids for duplicate data-toc-id values', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, id: 'dup', 'data-toc-id': 'dup' },
          content: [{ type: 'text', text: 'First' }],
        },
        {
          type: 'heading',
          attrs: { level: 1, id: 'dup', 'data-toc-id': 'dup' },
          content: [{ type: 'text', text: 'Second' }],
        },
      ],
    }
    const result = generateTocIds(doc, [...baseExtensions, TableOfContents])
    const [first, second] = result.content ?? []

    expect(first.attrs?.['data-toc-id']).toBe('dup')
    expect(second.attrs?.['data-toc-id']).not.toBe('dup')
    expect(second.attrs?.['data-toc-id']).toEqual(expect.any(String))
  })

  it('does not modify non-anchor nodes', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Intro' }],
        },
      ],
    }
    const result = generateTocIds(doc, [...baseExtensions, TableOfContents])

    expect(result.content?.[0].attrs?.id).toBeUndefined()
    expect(result.content?.[1].attrs?.id).toEqual(expect.any(String))
  })

  it('respects a custom getId option', () => {
    const result = generateTocIds(docWithHeadings('Hello World'), [
      ...baseExtensions,
      TableOfContents.configure({
        getId: textContent => textContent.toLowerCase().replace(/\s+/g, '-'),
      }),
    ])

    expect(result.content?.[0].attrs?.id).toBe('hello-world')
    expect(result.content?.[0].attrs?.['data-toc-id']).toBe('hello-world')
  })

  it('returns an empty content array unchanged', () => {
    const doc: JSONContent = { type: 'doc', content: [] }
    const result = generateTocIds(doc, [...baseExtensions, TableOfContents])

    expect(result).toEqual({ type: 'doc' })
  })
})
