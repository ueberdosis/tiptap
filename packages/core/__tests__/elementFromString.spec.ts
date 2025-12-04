import { elementFromString } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('elementFromString', () => {
  it('should parse basic HTML content', () => {
    const result = elementFromString('<p>Hello World</p>')

    expect(result.innerHTML).toBe('<p>Hello World</p>')
  })

  it('should parse plain text content', () => {
    const result = elementFromString('Hello World')

    expect(result.innerHTML).toBe('Hello World')
  })

  it('should parse empty string', () => {
    const result = elementFromString('')

    expect(result.innerHTML).toBe('')
  })

  it('should preserve leading whitespace', () => {
    const result = elementFromString('   Hello World')

    expect(result.innerHTML).toBe('   Hello World')
  })

  it('should preserve trailing whitespace', () => {
    const result = elementFromString('Hello World   ')

    expect(result.innerHTML).toBe('Hello World   ')
  })

  it('should preserve leading and trailing whitespace', () => {
    const result = elementFromString('   Hello World   ')

    expect(result.innerHTML).toBe('   Hello World   ')
  })

  it('should preserve newline-only text nodes', () => {
    const result = elementFromString('<p>First</p>\n<p>Second</p>')

    expect(result.innerHTML).toBe('<p>First</p>\n<p>Second</p>')
  })

  it('should preserve multiple newlines between elements', () => {
    const result = elementFromString('<p>First</p>\n\n\n<p>Second</p>')

    expect(result.innerHTML).toBe('<p>First</p>\n\n\n<p>Second</p>')
  })

  it('should preserve whitespace with newlines', () => {
    const result = elementFromString('<p>First</p>\n  \n<p>Second</p>')

    expect(result.innerHTML).toBe('<p>First</p>\n  \n<p>Second</p>')
  })

  it('should preserve internal whitespace in text', () => {
    const result = elementFromString('<p>Hello    World</p>')

    expect(result.innerHTML).toBe('<p>Hello    World</p>')
  })

  it('should parse nested HTML elements', () => {
    const result = elementFromString('<div><p>Nested <strong>content</strong></p></div>')

    expect(result.innerHTML).toBe('<div><p>Nested <strong>content</strong></p></div>')
  })

  it('should handle mixed content with text and elements', () => {
    const result = elementFromString('Text before <p>paragraph</p> text after')

    expect(result.innerHTML).toBe('Text before <p>paragraph</p> text after')
  })

  it('should preserve whitespace in pre tags', () => {
    const result = elementFromString('<pre>  code\n  with\n  indentation  </pre>')

    expect(result.innerHTML).toBe('<pre>  code\n  with\n  indentation  </pre>')
  })

  it('should return an HTMLElement (body element)', () => {
    const result = elementFromString('<p>Test</p>')

    expect(result).toBeInstanceOf(HTMLElement)
    expect(result.tagName).toBe('BODY')
  })

  it('should handle special characters in content', () => {
    const result = elementFromString('<p>&amp; &lt; &gt; &quot;</p>')

    expect(result.innerHTML).toBe('<p>&amp; &lt; &gt; "</p>')
  })

  it('should handle self-closing tags', () => {
    const result = elementFromString('<p>Line 1<br>Line 2</p>')

    expect(result.innerHTML).toBe('<p>Line 1<br>Line 2</p>')
  })

  // Additional whitespace cases
  it('should preserve tab characters', () => {
    const result = elementFromString('<p>Hello\tWorld</p>')

    expect(result.innerHTML).toBe('<p>Hello\tWorld</p>')
  })

  it('should preserve carriage return characters', () => {
    const result = elementFromString('<p>Hello\r\nWorld</p>')

    // \r\n is preserved as-is
    expect(result.innerHTML).toBe('<p>Hello\r\nWorld</p>')
  })

  it('should handle whitespace-only content', () => {
    const result = elementFromString('   ')

    expect(result.innerHTML).toBe('   ')
  })

  it('should handle newline-only content', () => {
    const result = elementFromString('\n\n\n')

    expect(result.innerHTML).toBe('\n\n\n')
  })

  it('should handle mixed whitespace-only content', () => {
    const result = elementFromString('  \n\t\n  ')

    expect(result.innerHTML).toBe('  \n\t\n  ')
  })

  // Unicode cases
  it('should handle unicode content', () => {
    const result = elementFromString('<p>Hello 世界 🌍</p>')

    expect(result.innerHTML).toBe('<p>Hello 世界 🌍</p>')
  })

  it('should handle non-breaking spaces', () => {
    const result = elementFromString('<p>Hello&nbsp;World</p>')

    expect(result.innerHTML).toBe('<p>Hello&nbsp;World</p>')
  })

  // Structure cases
  it('should handle multiple sibling elements', () => {
    const result = elementFromString('<p>One</p><p>Two</p><p>Three</p>')

    expect(result.innerHTML).toBe('<p>One</p><p>Two</p><p>Three</p>')
  })

  it('should handle deeply nested structures', () => {
    const result = elementFromString('<div><div><div><p>Deep</p></div></div></div>')

    expect(result.innerHTML).toBe('<div><div><div><p>Deep</p></div></div></div>')
  })

  it('should handle inline elements with surrounding whitespace', () => {
    const result = elementFromString('<p>Hello <strong> bold </strong> world</p>')

    expect(result.innerHTML).toBe('<p>Hello <strong> bold </strong> world</p>')
  })

  it('should preserve attributes with whitespace values', () => {
    const result = elementFromString('<p data-value="hello world">Test</p>')

    expect(result.innerHTML).toBe('<p data-value="hello world">Test</p>')
  })

  // HTML comments
  it('should preserve HTML comments', () => {
    const result = elementFromString('<p>Before</p><!-- comment --><p>After</p>')

    expect(result.innerHTML).toBe('<p>Before</p><!-- comment --><p>After</p>')
  })

  it('should handle content with only HTML comments', () => {
    const result = elementFromString('<!-- just a comment -->')

    expect(result.innerHTML).toBe('<!-- just a comment -->')
  })

  // Edge cases / potentially malformed HTML
  it('should handle unclosed tags (browser auto-closes)', () => {
    const result = elementFromString('<p>Unclosed paragraph')

    // Browser will auto-close the tag
    expect(result.innerHTML).toBe('<p>Unclosed paragraph</p>')
  })

  it('should handle mismatched tags (browser corrects)', () => {
    const result = elementFromString('<p>Hello <strong>world</p></strong>')

    // Browser will correct the nesting
    expect(result.querySelector('p')).not.toBeNull()
    expect(result.querySelector('strong')).not.toBeNull()
  })

  it('should handle invalid HTML entities gracefully', () => {
    const result = elementFromString('<p>&invalid; &also-invalid;</p>')

    // Invalid entities are preserved as-is
    expect(result.innerHTML).toBe('<p>&amp;invalid; &amp;also-invalid;</p>')
  })

  it('should handle script tags (included but not executed)', () => {
    const result = elementFromString('<script>alert("test")</script>')

    expect(result.innerHTML).toBe('<script>alert("test")</script>')
  })

  it('should handle style tags', () => {
    const result = elementFromString('<style>p { color: red; }</style>')

    expect(result.innerHTML).toBe('<style>p { color: red; }</style>')
  })

  // Complex real-world cases
  it('should handle complex HTML with mixed whitespace', () => {
    const html = `<div>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</div>`
    const result = elementFromString(html)

    expect(result.innerHTML).toBe(html)
  })

  it('should handle lists with whitespace formatting', () => {
    const html = `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>`
    const result = elementFromString(html)

    expect(result.innerHTML).toBe(html)
  })

  it('should handle tables with whitespace', () => {
    const html = `<table>
  <tr>
    <td>Cell</td>
  </tr>
</table>`
    const result = elementFromString(html)

    // Browser automatically wraps <tr> in <tbody>
    expect(result.innerHTML).toBe(`<table>
  <tbody><tr>
    <td>Cell</td>
  </tr>
</tbody></table>`)
  })
})
