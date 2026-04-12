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

    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content).toBeDefined()

    const paragraph = doc.content![0]
    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.content).toBeDefined()

    // Find text nodes with code marks (inline code)
    const codeTextNodes = paragraph.content!.filter(
      (n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'code'),
    )
    expect(codeTextNodes.length).toBeGreaterThan(0)

    // At least one code segment should contain an HTML-like tag
    const hasHtmlTag = codeTextNodes.some((n: any) => n.text && (n.text.includes('<h1>') || n.text.includes('<h6>')))
    expect(hasHtmlTag).toBe(true)

    // All text content combined should include both HTML tags and the tilde
    const allTextNodes = paragraph.content!.filter((n: any) => n.type === 'text')
    const allText = allTextNodes.map((n: any) => n.text).join('')
    expect(allText).toContain('h1')
    expect(allText).toContain('h6')
    expect(allText).toMatch(/~/)
  })

  it('parses inline code with HTML-like tags and double strike marks without error', () => {
    const md = '`<h1>`~~`<h6>`'

    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content).toBeDefined()

    const paragraph = doc.content![0]
    expect(paragraph.type).toBe('paragraph')

    // Find text nodes with code marks
    const codeTextNodes = paragraph.content!.filter(
      (n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'code'),
    )
    expect(codeTextNodes.length).toBeGreaterThan(0)

    // At least one code segment should contain an HTML-like tag
    const hasHtmlTag = codeTextNodes.some((n: any) => n.text && (n.text.includes('<h1>') || n.text.includes('<h6>')))
    expect(hasHtmlTag).toBe(true)

    // All text should contain both HTML tags
    const allTextNodes = paragraph.content!.filter((n: any) => n.type === 'text')
    const allText = allTextNodes.map((n: any) => n.text).join('')
    expect(allText).toContain('h1')
    expect(allText).toContain('h6')
  })

  it('parses strike marks in normal text', () => {
    const md = 'a~b'
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(Array.isArray(doc.content)).toBe(true)
  })

  it('parses HTML heading tags with strike marks', () => {
    const md = '<h1>~~test~~</h1>'

    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content).toBeDefined()

    const paragraph = doc.content![0]
    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.content).toBeDefined()

    // In Node.js environment, HTML tags should be treated as literal text
    const allText = paragraph
      .content!.map((n: any) => (n.text ? n.text : n.content?.map((c: any) => c.text).join('') || ''))
      .join('')

    // Should contain the HTML tags as literal text
    expect(allText).toContain('<h1>')
    expect(allText).toContain('</h1>')

    // Should contain 'test' text
    expect(allText).toContain('test')
  })

  it('parses multiple inline code segments with HTML-like content and strike', () => {
    const md = 'text `<h1>` more ~~text~~ and `<h2>`'

    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content).toBeDefined()

    const paragraph = doc.content![0]
    expect(paragraph.type).toBe('paragraph')

    // Find text nodes with code marks (inline code)
    const codeTextNodes = paragraph.content!.filter(
      (n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'code'),
    )
    expect(codeTextNodes.length).toBeGreaterThanOrEqual(2)

    // Code text should contain literal HTML-like tags
    expect(codeTextNodes[0].text).toBe('<h1>')
    expect(codeTextNodes[1].text).toBe('<h2>')

    // Find text nodes with strike marks
    const textNodes = paragraph.content!.filter((n: any) => n.type === 'text')
    const strikeTextNode = textNodes.find(
      (n: any) => n.text && n.text.includes('text') && n.marks?.some((m: any) => m.type === 'strike'),
    )
    expect(strikeTextNode).toBeDefined()
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
