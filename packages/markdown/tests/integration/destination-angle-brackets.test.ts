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

  it.each([
    [String.raw`docs/My \> Plan.md`, String.raw`docs/My \\\> Plan.md`],
    [String.raw`docs/My \< Plan.md`, String.raw`docs/My \\\< Plan.md`],
  ])('preserves backslashes in the destination %s', (destination, escaped) => {
    const link = markdownManager.parse(`[My plan](<${escaped}> "Weekly plan")`)
    const image = markdownManager.parse(`![My photo](<${escaped}> "Weekly photo")`)

    expect(link.content?.[0]?.content?.[0]?.marks?.[0]?.attrs?.href).toBe(destination)
    expect(image.content?.[0]?.attrs?.src).toBe(destination)

    const linkOutput = markdownManager.serialize(link)
    const imageOutput = markdownManager.serialize(image)

    expect(linkOutput).toBe(`[My plan](<${escaped}> "Weekly plan")`)
    expect(imageOutput).toBe(`![My photo](<${escaped}> "Weekly photo")`)
    expect(markdownManager.parse(linkOutput)).toEqual(link)
    expect(markdownManager.parse(imageOutput)).toEqual(image)
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
    // a bare destination may contain angle brackets literally, so they must not be escaped there
    expect(markdownManager.serialize(markdownManager.parse('[plan](My>Plan.md)'))).toBe(
      '[plan](My>Plan.md)',
    )
  })

  it('escapes angle brackets inside a bracketed link destination', () => {
    const json = markdownManager.parse('[My plan](<docs/My Plan \\> v2.md>)')

    expect(json.content?.[0]?.content?.[0]?.marks?.[0]?.attrs?.href).toBe('docs/My Plan > v2.md')

    const output = markdownManager.serialize(json)

    expect(output).toBe('[My plan](<docs/My Plan \\> v2.md>)')
    expect(markdownManager.parse(output)).toEqual(json)
  })

  it('escapes angle brackets inside a bracketed image source', () => {
    const json = markdownManager.parse('![My photo](<images/My \\<Plan\\>.png>)')

    expect(json.content?.[0]?.attrs?.src).toBe('images/My <Plan>.png')

    const output = markdownManager.serialize(json)

    expect(output).toBe('![My photo](<images/My \\<Plan\\>.png>)')
    expect(markdownManager.parse(output)).toEqual(json)
  })
})
