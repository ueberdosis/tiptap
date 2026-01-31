import { describe, expect, it } from 'vitest'

import { elementFromString } from '../utilities/elementFromString.js'

describe('elementFromString', () => {
  it('throws error when window is undefined', () => {
    // Mock window as undefined
    const originalWindow = global.window
    ;(global as any).window = undefined

    expect(() => elementFromString('<div>test</div>')).toThrow(
      '[tiptap error]: there is no window object available, so this function cannot be used',
    )

    // Restore window
    ;(global as any).window = originalWindow
  })

  it('parses simple HTML element', () => {
    const result = elementFromString('<div>Hello World</div>')

    expect(result.tagName).toBe('BODY')
    expect(result.children.length).toBe(1)
    expect(result.children[0].tagName).toBe('DIV')
    expect(result.children[0].textContent).toBe('Hello World')
  })

  it('parses multiple elements', () => {
    const result = elementFromString('<p>First</p><p>Second</p>')

    expect(result.children.length).toBe(2)
    expect(result.children[0].tagName).toBe('P')
    expect(result.children[0].textContent).toBe('First')
    expect(result.children[1].tagName).toBe('P')
    expect(result.children[1].textContent).toBe('Second')
  })

  it('removes whitespace-only text nodes with newline and two spaces', () => {
    const html = `<div>
  <p>Content</p>
</div>`
    const result = elementFromString(html)

    // Should remove the whitespace text node between div and p
    const div = result.children[0] as HTMLElement
    expect(div.children.length).toBe(1)
    expect(div.children[0].tagName).toBe('P')
    expect(div.children[0].textContent).toBe('Content')
  })

  it('removes standalone newline text nodes', () => {
    const html = `<div>
<p>Content</p>
</div>`
    const result = elementFromString(html)

    const div = result.children[0] as HTMLElement
    expect(div.children.length).toBe(1)
    expect(div.children[0].tagName).toBe('P')
  })

  it('preserves content with regular whitespace', () => {
    const result = elementFromString('<p>Hello World</p>')

    expect(result.children[0].textContent).toBe('Hello World')
  })

  it('preserves whitespace within text content', () => {
    const result = elementFromString('<p>Hello   World</p>')

    expect(result.children[0].textContent).toBe('Hello   World')
  })

  it('handles nested elements and removes appropriate whitespace', () => {
    const html = `<div>
  <section>
    <p>Content</p>
  </section>
</div>`
    const result = elementFromString(html)

    const div = result.children[0] as HTMLElement
    const section = div.children[0] as HTMLElement
    const p = section.children[0] as HTMLElement

    expect(div.tagName).toBe('DIV')
    expect(section.tagName).toBe('SECTION')
    expect(p.tagName).toBe('P')
    expect(p.textContent).toBe('Content')
  })

  it('preserves elements with attributes', () => {
    const result = elementFromString('<div class="test" id="myDiv">Content</div>')

    const div = result.children[0] as HTMLElement
    expect(div.tagName).toBe('DIV')
    expect(div.getAttribute('class')).toBe('test')
    expect(div.getAttribute('id')).toBe('myDiv')
    expect(div.textContent).toBe('Content')
  })

  it('handles empty string', () => {
    const result = elementFromString('')

    expect(result.tagName).toBe('BODY')
    expect(result.children.length).toBe(0)
  })

  it('handles self-closing tags', () => {
    const result = elementFromString('<img src="test.jpg" alt="test" />')

    const img = result.children[0] as HTMLElement
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('src')).toBe('test.jpg')
    expect(img.getAttribute('alt')).toBe('test')
  })

  it('preserves text nodes that do not match whitespace pattern', () => {
    const result = elementFromString('<p> Hello </p>')

    expect(result.children[0].textContent).toBe(' Hello ')
  })
})
