/**
 * @vitest-environment happy-dom
 */

import { Node } from '@tiptap/core'
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

  it('preserves angle-bracket text with spaces as literal text', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })

    // `<this is a placeholder>` contains spaces, so the tag name is invalid.
    // The browser creates an HTMLUnknownElement and the manager should
    // preserve the whole string as literal text instead of silently dropping it.
    const doc = manager.parse('<this is a placeholder>')
    const text = collectText(doc)
    expect(text).toContain('<this is a placeholder>')
  })

  it('recognizes non-hyphenated custom tags declared in schema parseDOM', () => {
    const Something = Node.create({
      name: 'something',
      group: 'inline',
      inline: true,
      content: 'text*',
      renderHTML: () => ['something', 0],
      parseHTML: () => [{ tag: 'something' }],
    })
    const SomethingWithHyphen = Node.create({
      name: 'something-with-hyphen',
      group: 'inline',
      inline: true,
      content: 'text*',
      renderHTML: () => ['something-with-hyphen', 0],
      parseHTML: () => [{ tag: 'something-with-hyphen' }],
    })

    const manager = new MarkdownManager({ extensions: [...basicExtensions, Something, SomethingWithHyphen] })

    // `<something>` is not a standard HTML tag (no hyphen), so the browser would
    // normally create an HTMLUnknownElement. However, because the schema has
    // a registered extension declaring parseDOM `{ tag: 'something' }`, the
    // manager should treat it as a recognized element.
    const doc = manager.parse(
      '<something>happy</something><something attribute="a">happy</something><something-with-hyphen attribute="a">joyful</something-with-hyphen>',
    )
    const text = collectText(doc)
    expect(text).toContain('happy')
    expect(text).toContain('joyful')
    expect(text).not.toContain('<something>')
    expect(text).not.toContain('</something>')
    expect(text).not.toContain('<something-with-hyphen>')
    expect(text).not.toContain('</something-with-hyphen>')
  })

  it('recognizes non-standard tags listed in knownHtmlTags option', () => {
    // Pass `knownHtmlTags` instead of a schema extension to verify the
    // option bypasses the HTMLUnknownElement check.
    const manager = new MarkdownManager({
      extensions: basicExtensions,
      knownHtmlTags: ['something'],
    })

    const doc = manager.parse('<something>happy</something>')
    const text = collectText(doc)
    expect(text).toContain('happy')
    expect(text).not.toContain('<something>')
    expect(text).not.toContain('</something>')
  })

  it('recognizes knownHtmlTags case-insensitively', () => {
    const manager = new MarkdownManager({
      extensions: basicExtensions,
      knownHtmlTags: ['SOMETHING'],
    })

    const doc = manager.parse('<SOMETHING>happy</SOMETHING>')
    const text = collectText(doc)
    expect(text).toContain('happy')
    expect(text).not.toContain('<SOMETHING>')
    expect(text).not.toContain('</SOMETHING>')
  })

  it('preserves angle-bracket placeholders like <insert PR number here> as literal text', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })

    // Common real-world pattern: angle brackets used as placeholders.
    // Marked treats this as an HTML token, but it's not a real element.
    // The manager should preserve the full string as literal text.
    const md = 'The bug was fixed in <insert PR number here> - please review it'
    const doc = manager.parse(md)

    const text = collectText(doc)
    expect(text).toContain('<insert PR number here>')
    expect(text).toContain('The bug was fixed in')
    expect(text).toContain('please review it')
  })
})
