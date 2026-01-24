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

  it('parses HTML tags as plain text in server environment', () => {
    const md = '<p>Hello</p>'

    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content).toBeDefined()
    expect(Array.isArray(doc.content)).toBe(true)

    // The document should have a paragraph
    const paragraph = doc.content![0]
    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.content).toBeDefined()

    // The HTML should be preserved as literal text (not parsed)
    const textContent = paragraph.content!.map((n: any) => n.text).join('')
    expect(textContent).toContain('<p>Hello</p>')
  })

  it('still parses markdown syntax correctly alongside HTML', () => {
    const md = '<div>test</div> ~~world~~'

    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content).toBeDefined()

    // Find all text nodes
    const textNodes = doc.content!.flatMap((node: any) =>
      node.content ? node.content.filter((n: any) => n.type === 'text') : [],
    )

    // Should have HTML as literal text
    const hasHtmlText = textNodes.some((n: any) => n.text && n.text.includes('<div>test</div>'))
    expect(hasHtmlText).toBe(true)

    // Should have 'world' text (with or without strike mark depending on parsing)
    const hasWorldText = textNodes.some((n: any) => n.text && n.text.includes('world'))
    expect(hasWorldText).toBe(true)
  })
})
