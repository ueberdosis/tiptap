/**
 * @vitest-environment node
 */

import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('MarkdownManager Server-side Parsing', () => {
  let manager: MarkdownManager
  const basicExtensions = [Document, Paragraph, Text, Strike, Code, Heading]

  beforeEach(() => {
    manager = new MarkdownManager({ extensions: basicExtensions })
  })

  it('parses inline code with HTML-like tags and strike marks without error', () => {
    const md = '`<h1>`~`<h6>`'

    // This should not throw an error about window object
    expect(() => {
      const doc = manager.parse(md)
      expect(doc.type).toBe('doc')
    }).not.toThrow()
  })

  it('parses inline code with HTML-like tags and double strike marks without error', () => {
    const md = '`<h1>`~~`<h6>`'

    expect(() => {
      const doc = manager.parse(md)
      expect(doc.type).toBe('doc')
    }).not.toThrow()
  })

  it('parses strike marks in normal text', () => {
    const md = 'a~b'
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(Array.isArray(doc.content)).toBe(true)
  })

  it('parses HTML heading tags with strike marks', () => {
    const md = '<h1>~~test~~</h1>'

    expect(() => {
      const doc = manager.parse(md)
      expect(doc.type).toBe('doc')
    }).not.toThrow()
  })

  it('parses multiple inline code segments with HTML-like content and strike', () => {
    const md = 'text `<h1>` more ~~text~~ and `<h2>`'

    expect(() => {
      const doc = manager.parse(md)
      expect(doc.type).toBe('doc')
    }).not.toThrow()
  })

  it('parses HTML tags without requiring window object', () => {
    const md = '<p>Hello</p> ~~world~~'

    expect(() => {
      const doc = manager.parse(md)
      expect(doc.type).toBe('doc')
    }).not.toThrow(/window object/)
  })
})
