import { Document } from '@tiptap/extension-document'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('destinations containing a space', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Link, Image],
  })

  it('wraps a link destination in angle brackets so it can be reparsed', () => {
    const json = markdownManager.parse('[My plan](<docs/My Plan.md>)')

    expect(json.content?.[0]?.content?.[0]?.marks?.[0]?.attrs?.href).toBe('docs/My Plan.md')

    const output = markdownManager.serialize(json)

    expect(output).toBe('[My plan](<docs/My Plan.md>)')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('wraps an image source in angle brackets so it can be reparsed', () => {
    const json = markdownManager.parse('![My photo](<images/My Photo.png>)')

    expect(json.content?.[0]?.attrs?.src).toBe('images/My Photo.png')

    const output = markdownManager.serialize(json)

    expect(output).toBe('![My photo](<images/My Photo.png>)')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('keeps the title after a bracketed destination', () => {
    const json = markdownManager.parse('[My plan](<docs/My Plan.md> "Weekly plan")')
    const output = markdownManager.serialize(json)

    expect(json.content?.[0]?.content?.[0]?.marks?.[0]?.attrs?.title).toBe('Weekly plan')
    expect(output).toBe('[My plan](<docs/My Plan.md> "Weekly plan")')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('leaves destinations without a space untouched', () => {
    expect(
      markdownManager.serialize(markdownManager.parse('[My plan](https://example.com/a-b)')),
    ).toBe('[My plan](https://example.com/a-b)')
    expect(markdownManager.serialize(markdownManager.parse('![photo](images/photo.png)'))).toBe(
      '![photo](images/photo.png)',
    )
  })
})
