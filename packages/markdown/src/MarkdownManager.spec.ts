import { generateJSON } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect,test } from 'vitest'

import MarkdownManager from './MarkdownManager.js'

describe('MarkdownManager', () => {
  test('should create a new instance', () => {
    const manager = new MarkdownManager({
      extensions: [StarterKit],
    })

    expect(manager).toBeInstanceOf(MarkdownManager)
  })

  test('should create a new instance without extensions', () => {
    const manager = new MarkdownManager({
      extensions: [],
    })

    expect(manager).toBeInstanceOf(MarkdownManager)
  })

  test('should parse markdown correctly', () => {
    const manager = new MarkdownManager({
      extensions: [StarterKit],
    })

    const result = manager.parse('# Hello World')
    expect(result).toEqual({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            {
              type: 'text',
              text: 'Hello World',
            },
          ],
        },
      ],
    })
  })

  test('should serialize json correctly', () => {
    const manager = new MarkdownManager({
      extensions: [StarterKit],
    })

    const result = manager.serialize({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            {
              type: 'text',
              text: 'Hello World',
            },
          ],
        },
      ],
    })

    expect(result).toEqual('# Hello World')
  })

  test('should serialize complex documents', () => {
    const extensions = [StarterKit]

    const manager = new MarkdownManager({
      extensions,
    })

    const html = `
<h1>Hello World</h1>
<p>This is a paragraph.</p>
<ul>
  <li>
    <p>Item 1</p>
  </li>
  <li>
    <p>Item 2</p>
    <ul>
      <li>
        <p>Item 1</p>
      </li>
      <li>
        <p>Item 2</p>
      </li>
    </ul>
  </li>
</ul>
<ol>
  <li>
    <p>Item 1</p>
  </li>
  <li>
    <p>Item 2</p>
    <ul>
      <li>
        <p>Item 1</p>
      </li>
      <li>
        <p>Item 2</p>
      </li>
    </ul>
  </li>
</ol>
      `

    const json = generateJSON(html, extensions)

    const result = manager.serialize(json)

    const expected = `
# Hello World

This is a paragraph.

- Item 1
- Item 2
  - Item 1
  - Item 2

1. Item 1
2. Item 2
  - Item 1
  - Item 2
      `.trim()

    expect(result).toEqual(expected)
  })
})
