import { Editor, type JSONContent } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Highlight } from '@tiptap/extension-highlight'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { Underline } from '@tiptap/extension-underline'
import { Markdown } from '@tiptap/markdown'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const extensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Strike,
  Underline,
  Highlight,
  Code,
  Link,
]
const markdown = new MarkdownManager({ extensions })

const doc = (content: JSONContent[]): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph', content }],
})

const text = (value: string, ...types: string[]): JSONContent => ({
  type: 'text',
  text: value,
  ...(types.length ? { marks: types.map(type => ({ type })) } : {}),
})

describe('Whitespace at Markdown mark boundaries', () => {
  it.each([
    ['bold', '**word**'],
    ['italic', '*word*'],
    ['strike', '~~word~~'],
    ['underline', '<u>word</u>'],
    ['highlight', '==word=='],
    ['code', '`word`'],
    ['link', '[word](https://example.com)'],
  ])('round-trips %s with whitespace on either or both sides', (type, markedWord) => {
    const mark =
      type === 'link' ? { type, attrs: { href: 'https://example.com', title: null } } : { type }

    for (const [leading, trailing] of [
      [' ', ''],
      ['', ' '],
      [' ', ' '],
      ['', ''],
    ]) {
      const content = doc([
        text('a '),
        { type: 'text', text: `${leading}word${trailing}`, marks: [mark] },
        text(' b'),
      ])
      const serialized = markdown.serialize(content)

      expect(serialized).toBe(`a ${leading}${markedWord}${trailing} b`)
      expect(markdown.parse(serialized)).toEqual(
        doc([
          text(`a ${leading}`),
          { type: 'text', text: 'word', marks: [mark] },
          text(`${trailing} b`),
        ]),
      )
    }
  })

  it('keeps inner whitespace in the outer mark and moves outer trailing whitespace out', () => {
    const content = doc([
      text('a ', 'bold'),
      text(' b ', 'bold', 'italic'),
      text(' ', 'bold'),
      text('end'),
    ])
    const editor = new Editor({ extensions: [...extensions, Markdown], content })
    const serialized = editor.getMarkdown()
    editor.destroy()

    expect(serialized).toBe('**a  *b***  end')
    expect(markdown.parse(serialized)).toEqual(
      doc([text('a  ', 'bold'), text('b', 'italic', 'bold'), text('  end')]),
    )
  })

  it('omits delimiters for a whitespace-only inner run split across nodes', () => {
    const content = doc([
      text('a ', 'bold'),
      text(' ', 'bold', 'italic'),
      text(' ', 'bold', 'italic'),
      text('end'),
    ])
    const serialized = markdown.serialize(content)

    expect(serialized).toBe('**a**   end')
    expect(markdown.parse(serialized)).toEqual(doc([text('a', 'bold'), text('   end')]))
  })

  it('preserves whitespace between the two parts of a split mark', () => {
    const content = doc([text('a ', 'bold'), text('b ', 'bold', 'italic'), text('c', 'italic')])
    const serialized = markdown.serialize(content)

    expect(markdown.parse(serialized)).toEqual(
      doc([text('a ', 'bold'), text('b', 'italic', 'bold'), text(' '), text('c', 'italic')]),
    )
  })

  it('keeps the spaces at paragraph boundaries', () => {
    const content = doc([text(' word ', 'bold')])
    const serialized = markdown.serialize(content)

    expect(serialized).toBe(' **word** ')
    expect(markdown.parse(serialized)).toEqual(doc([text(' '), text('word', 'bold'), text(' ')]))
  })

  it.each(['    ', '\t', ' \t'])('keeps paragraph indentation %j outside the mark', indentation => {
    const source = doc([text(`${indentation}word`, 'bold')])
    const serialized = markdown.serialize(source)
    const parsed = markdown.parse(serialized)

    expect(parsed).toEqual(doc([text(indentation), text('word', 'bold')]))
    expect(markdown.serialize(parsed)).toBe(serialized)
  })

  it('pads a code fence when moving whitespace exposes literal backticks', () => {
    const content = doc([text('press'), text(' `key` ', 'code'), text('now')])
    const serialized = markdown.serialize(content)

    expect(serialized).toBe('press `` `key` `` now')
    expect(markdown.parse(serialized)).toEqual(
      doc([text('press '), text('`key`', 'code'), text(' now')]),
    )
  })
})
