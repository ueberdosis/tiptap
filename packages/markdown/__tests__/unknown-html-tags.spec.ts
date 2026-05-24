/**
 * @vitest-environment happy-dom
 */

import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

/**
 * When markdown content contains text inside angle brackets that looks
 * like an HTML tag but is not a recognized HTML element (and is not in
 * the schema), marked passes it through as raw HTML. The browser's DOM
 * parser then creates an unknown element with no text content, which is
 * silently swallowed during schema-aware parsing.
 *
 * The expected behavior is that unrecognized HTML-like text should be
 * preserved as literal plain text instead of being lost.
 */
describe('MarkdownManager unrecognized HTML tags', () => {
  const basicExtensions = [Document, Paragraph, Text, Heading, Italic]

  const collectText = (node: any): string => {
    if (!node) {
      return ''
    }
    if (typeof node === 'string') {
      return node
    }
    if (Array.isArray(node)) {
      return node.map(collectText).join('')
    }
    if (node.type === 'text' && typeof node.text === 'string') {
      return node.text
    }
    if (Array.isArray(node.content)) {
      return node.content.map(collectText).join('')
    }
    return ''
  }

  it('does not silently swallow text inside an unknown opening tag at block level', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })
    const md = '<enter existing CID here if available>\n\nother text after'
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(Array.isArray(doc.content)).toBe(true)

    // The original "enter existing CID here if available" content must survive
    // somewhere in the parsed document - it must not be silently dropped.
    const text = collectText(doc)
    expect(text).toContain('enter existing CID here if available')
    expect(text).toContain('other text after')
  })

  it('does not silently swallow text inside an unknown opening tag inline', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })
    const md = 'before <enter existing CID here> after'
    const doc = manager.parse(md)

    const text = collectText(doc)
    expect(text).toContain('before')
    expect(text).toContain('enter existing CID here')
    expect(text).toContain('after')
  })

  it('still parses recognized inline HTML elements normally', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })
    const md = 'hello <em>world</em>'
    const doc = manager.parse(md)

    const text = collectText(doc)
    expect(text).toContain('hello')
    expect(text).toContain('world')
  })

  it('does not render raw markup for recognized but empty HTML elements', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })

    // Empty <em></em> / <span></span> have no text content and no void element,
    // but they are still real HTML – they must not be rendered as literal text.
    ;['<em></em>', '<em> </em>', '<span></span>'].forEach(md => {
      const doc = manager.parse(md)
      const text = collectText(doc)
      expect(text).not.toContain('<em>')
      expect(text).not.toContain('</em>')
      expect(text).not.toContain('<span>')
      expect(text).not.toContain('</span>')
    })
  })

  it('does not flag hyphenated custom elements as unrecognized', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })

    // Hyphenated tag names are valid custom elements per the HTML spec – the
    // browser constructs them as HTMLElement, not HTMLUnknownElement.
    const doc = manager.parse('<my-mention></my-mention>')
    const text = collectText(doc)
    expect(text).not.toContain('<my-mention>')
    expect(text).not.toContain('</my-mention>')
  })
})
