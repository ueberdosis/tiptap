import { getSchema } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('Code nested in other marks (#8637)', () => {
  it('parses code inside bold/link into a schema-valid document with default Code excludes', () => {
    const extensions = [StarterKit]
    const manager = new MarkdownManager({ extensions })
    const json = manager.parse('**`foo`** and [`bar`](https://example.com)')

    expect(() => getSchema(extensions).nodeFromJSON(json).check()).not.toThrow()
  })

  it('serializes adjacent code spans with outer marks without nesting mark syntax inside backticks', () => {
    const extensions = [
      Document,
      Paragraph,
      Text,
      Bold,
      Link.configure({ openOnClick: false }),
      Code,
    ]
    const manager = new MarkdownManager({ extensions })

    expect(manager.serialize(manager.parse('`a`**`b`**'))).toBe('`a`**`b`**')
    expect(manager.serialize(manager.parse('`a`[`b`](https://example.com)'))).toBe(
      '`a`[`b`](https://example.com)',
    )
  })

  it('splits a code run when a mark covers only part of it', () => {
    const extensions = [Document, Paragraph, Text, Bold, Code]
    const manager = new MarkdownManager({ extensions })

    const out = manager.serialize({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'foo ', marks: [{ type: 'code' }] },
            { type: 'text', text: 'bar', marks: [{ type: 'bold' }, { type: 'code' }] },
          ],
        },
      ],
    })

    expect(out).toBe('`foo `**`bar`**')
  })

  it('splits a bold+code run when only code continues (reverse partial mark)', () => {
    const extensions = [Document, Paragraph, Text, Bold, Code]
    const manager = new MarkdownManager({ extensions })

    const out = manager.serialize({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'foo', marks: [{ type: 'bold' }, { type: 'code' }] },
            { type: 'text', text: 'bar', marks: [{ type: 'code' }] },
          ],
        },
      ],
    })

    expect(out).toBe('**`foo`**`bar`')
  })
})
