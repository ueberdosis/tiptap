import { Bold } from '@tiptap/extension-bold'
import { Code } from '@tiptap/extension-code'
import { Document } from '@tiptap/extension-document'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../src/MarkdownManager.js'

describe('Whitespace-only marked text nodes', () => {
  const extensions = [Document, Paragraph, Text, Bold, Italic, Code, Strike]
  const markdownManager = new MarkdownManager({ extensions })

  const paragraph = (content: Array<Record<string, any>>) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content }],
  })

  it.each([
    ['bold', 'a b'],
    ['italic', 'a b'],
    ['code', 'a b'],
    ['strike', 'a b'],
  ])('emits no delimiters for a whitespace-only %s node', (markType, expected) => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: ' ', marks: [{ type: markType }] },
        { type: 'text', text: 'b' },
      ]),
    )

    expect(markdown).toBe(expected)
  })

  it.each([
    ['tab', '\t'],
    ['non-breaking space', '\u00a0'],
    ['newline', '\n'],
  ])('emits no delimiters for a whitespace-only node containing a %s', (_name, whitespace) => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: whitespace, marks: [{ type: 'bold' }] },
        { type: 'text', text: 'b' },
      ]),
    )

    expect(markdown).toBe(`a${whitespace}b`)
  })

  it('emits no delimiters for a multi-space whitespace-only node', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: '  ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'b' },
      ]),
    )

    expect(markdown).toBe('a  b')
  })

  it('emits no delimiters when a whitespace-only node carries nested marks', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: ' ', marks: [{ type: 'bold' }, { type: 'italic' }] },
        { type: 'text', text: 'b' },
      ]),
    )

    expect(markdown).toBe('a b')
  })

  it('opens a continuing mark after the whitespace (Issue #8212)', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: ' ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
      ]),
    )

    expect(markdown).toBe('a **b**')
  })

  it('keeps a continuing mark and drops the transient one', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: ' ', marks: [{ type: 'bold' }, { type: 'italic' }] },
        { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
      ]),
    )

    expect(markdown).toBe('a **b**')
  })

  it('keeps a continuing italic when bold is the transient mark', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: ' ', marks: [{ type: 'bold' }, { type: 'italic' }] },
        { type: 'text', text: 'b', marks: [{ type: 'italic' }] },
      ]),
    )

    expect(markdown).toBe('a *b*')
  })

  it('spans a mark across the whitespace when it opened on an earlier node', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' ', marks: [{ type: 'bold' }, { type: 'italic' }] },
        { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
      ]),
    )

    expect(markdown).toBe('**a b**')
  })

  it('closes an already-open mark before a whitespace-only node that ends it', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'b' },
      ]),
    )

    expect(markdown).toBe('**a** b')
  })

  it('keeps expelling trailing whitespace out of a mark that has text', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'Label: ', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'value' },
      ]),
    )

    expect(markdown).toBe('**Label:** value')
  })

  it.each([
    ['a single mark', [{ type: 'bold' }]],
    ['nested marks', [{ type: 'bold' }, { type: 'italic' }]],
  ])('survives repeated serialize/parse cycles with %s', (_name, marks) => {
    // Parsing `****` reads it as literal asterisks, which the next serialize escapes.
    // Assert the value on every cycle, not that it settles: the broken output settles too.
    let markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a' },
        { type: 'text', text: ' ', marks },
        { type: 'text', text: 'b' },
      ]),
    )

    for (let cycle = 0; cycle < 3; cycle += 1) {
      expect(markdown).toBe('a b')
      markdown = markdownManager.serialize(markdownManager.parse(markdown))
    }

    expect(markdown).toBe('a b')
  })

  it('still emphasises a node that is only punctuation', () => {
    const markdown = markdownManager.serialize(
      paragraph([{ type: 'text', text: ')', marks: [{ type: 'bold' }] }]),
    )

    expect(markdown).toBe('**)**')
  })
})
