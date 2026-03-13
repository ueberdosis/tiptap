import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Overlapping Marks - Issue #7590', () => {
  let mm: MarkdownManager

  beforeEach(() => {
    mm = new MarkdownManager()
    ;[
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      Strike,
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Underline,
    ].forEach(ext => mm.registerExtension(ext))
  })

  it('should produce valid markdown for bold→bold+italic→italic', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '123', marks: [{ type: 'bold' }] },
            { type: 'text', text: '456', marks: [{ type: 'bold' }, { type: 'italic' }] },
            { type: 'text', text: '789', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    // Should produce properly nested markdown, not the old broken **123*456**789*
    expect(result).toBe('**123*456***_789_')
    // Should round-trip correctly
    expect(mm.serialize(mm.parse(result))).toBe(result)
  })

  it('should produce valid markdown for italic→italic+bold→bold', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'aaa', marks: [{ type: 'italic' }] },
            { type: 'text', text: 'bbb', marks: [{ type: 'italic' }, { type: 'bold' }] },
            { type: 'text', text: 'ccc', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    // Bold should use alternate __ syntax to avoid ambiguous **** run
    expect(result).toBe('*aaa**bbb***__ccc__')
    expect(mm.serialize(mm.parse(result))).toBe(result)
  })

  it('should handle overlapping underline+bold', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'aaa', marks: [{ type: 'underline' }] },
            { type: 'text', text: 'bbb', marks: [{ type: 'underline' }, { type: 'bold' }] },
            { type: 'text', text: 'ccc', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    // ++ and ** use different characters, but bold reopens with __ after **++** closing
    expect(result).toBe('++aaa**bbb**++__ccc__')
    expect(mm.serialize(mm.parse(result))).toBe(result)
  })

  it('should handle overlapping strike+italic', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'abc', marks: [{ type: 'strike' }] },
            { type: 'text', text: 'def', marks: [{ type: 'strike' }, { type: 'italic' }] },
            { type: 'text', text: 'ghi', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    expect(mm.serialize(mm.parse(result))).toBe(result)
  })
})

describe('Italic inside Links - Issue #7553', () => {
  let mm: MarkdownManager

  beforeEach(() => {
    mm = new MarkdownManager()
    ;[
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      Strike,
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Underline,
    ].forEach(ext => mm.registerExtension(ext))
  })

  it('should place italic marks inside link brackets (marks: [link, italic])', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'google',
              marks: [{ type: 'link', attrs: { href: 'https://google.com', target: '_blank' } }, { type: 'italic' }],
            },
            {
              type: 'text',
              text: ' search',
              marks: [{ type: 'link', attrs: { href: 'https://google.com', target: '_blank' } }],
            },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    expect(result).toBe('[*google* search](https://google.com)')
  })

  it('should place italic marks inside link brackets (marks: [italic, link])', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'google',
              marks: [{ type: 'italic' }, { type: 'link', attrs: { href: 'https://google.com', target: '_blank' } }],
            },
            {
              type: 'text',
              text: ' search',
              marks: [{ type: 'link', attrs: { href: 'https://google.com', target: '_blank' } }],
            },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    expect(result).toBe('[*google* search](https://google.com)')
  })

  it('should place bold marks inside link brackets', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'click',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }, { type: 'bold' }],
            },
            {
              type: 'text',
              text: ' here',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
            },
          ],
        },
      ],
    }
    const result = mm.serialize(doc)
    expect(result).toBe('[**click** here](https://example.com)')
  })
})
