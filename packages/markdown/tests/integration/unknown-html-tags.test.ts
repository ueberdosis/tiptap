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
import { describe, expect, it } from 'vite-plus/test'

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

  it('preserves hyphenated placeholders not in the schema as literal text', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })

    // Hyphenated names are Custom Elements in the HTML sense, but without a
    // matching parseDOM rule they are placeholders (e.g. docs / runbooks) and
    // must not be silently dropped (#8623).
    const doc = manager.parse('Run kubectl logs <pod-name> -n <namespace>')
    const text = collectText(doc)
    expect(text).toContain('<pod-name>')
    expect(text).toContain('<namespace>')
    expect(text).toContain('Run kubectl logs')

    const empty = manager.parse('<my-mention></my-mention>')
    expect(collectText(empty)).toContain('<my-mention></my-mention>')
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

    const manager = new MarkdownManager({
      extensions: [...basicExtensions, Something, SomethingWithHyphen],
    })

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

  it('parses custom nodes matched by attribute-only parseDOM selectors', () => {
    const Widget = Node.create({
      name: 'widget',
      group: 'inline',
      inline: true,
      content: 'text*',
      renderHTML: () => ['custom-node', { 'data-kind': 'widget' }, 0],
      parseHTML: () => [{ tag: '[data-kind="widget"]' }],
    })

    const manager = new MarkdownManager({
      extensions: [...basicExtensions, Widget],
    })

    const doc = manager.parse('<custom-node data-kind="widget">value</custom-node>')
    const textContent = collectText(doc)
    expect(textContent).toContain('value')
    expect(textContent).not.toContain('<custom-node')
  })

  it('still parses HTML when placeholders appear only in attributes or comments', () => {
    const manager = new MarkdownManager({ extensions: basicExtensions })

    const withAttr = manager.parse('<em title="Use <pod-name>">value</em>')
    expect(collectText(withAttr)).toContain('value')
    expect(collectText(withAttr)).not.toContain('<em')

    const withComment = manager.parse('before <!-- <pod-name> --> after')
    const commented = collectText(withComment)
    expect(commented).toContain('before')
    expect(commented).toContain('after')
    expect(commented).not.toContain('<pod-name>')
  })
})
