import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'
import { extensions as customInlineExtensions } from '../fixtures/markdown/custom-inline.js'

describe('Marks on inline atom nodes', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Bold, Italic, HardBreak, ...customInlineExtensions],
  })

  const atom = '[custom-inline type="bug" id="1234"]'

  const paragraph = (content: Array<Record<string, any>>) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content }],
  })

  const atomNode = (marks?: Array<Record<string, any>>) => ({
    type: 'customInline',
    attrs: { type: 'bug', id: '1234' },
    ...(marks ? { marks } : {}),
  })

  it('keeps the mark on an atom that fills the whole emphasis', () => {
    const json = markdownManager.parse(`**${atom}**`)

    expect(json).toEqual(paragraph([atomNode([{ type: 'bold' }])]))
  })

  it('keeps the mark on an atom surrounded by text', () => {
    const json = markdownManager.parse(`**a ${atom} b**`)

    expect(json).toEqual(
      paragraph([
        { type: 'text', text: 'a ', marks: [{ type: 'bold' }] },
        atomNode([{ type: 'bold' }]),
        { type: 'text', text: ' b', marks: [{ type: 'bold' }] },
      ]),
    )
  })

  it('keeps nested marks on an atom', () => {
    const json = markdownManager.parse(`***${atom}***`)

    expect(json).toEqual(paragraph([atomNode([{ type: 'bold' }, { type: 'italic' }])]))
  })

  it('serializes a mark that spans an atom without reopening it', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        { type: 'text', text: 'a ', marks: [{ type: 'bold' }] },
        atomNode([{ type: 'bold' }]),
        { type: 'text', text: ' b', marks: [{ type: 'bold' }] },
      ]),
    )

    expect(markdown).toBe(`**a ${atom} b**`)
  })

  it('serializes a mark carried only by the atom', () => {
    const markdown = markdownManager.serialize(paragraph([atomNode([{ type: 'bold' }])]))

    expect(markdown).toBe(`**${atom}**`)
  })

  it('serializes nested marks on an atom in closing order', () => {
    const markdown = markdownManager.serialize(
      paragraph([atomNode([{ type: 'bold' }, { type: 'italic' }])]),
    )

    expect(markdown).toBe(`***${atom}***`)
  })

  it('wraps two adjacent atoms in a single mark pair', () => {
    const markdown = markdownManager.serialize(
      paragraph([atomNode([{ type: 'bold' }]), atomNode([{ type: 'bold' }])]),
    )

    expect(markdown).toBe(`**${atom}${atom}**`)
  })

  it('closes a mark before an atom that does not carry it', () => {
    const markdown = markdownManager.serialize(
      paragraph([{ type: 'text', text: 'a', marks: [{ type: 'bold' }] }, atomNode()]),
    )

    expect(markdown).toBe(`**a**${atom}`)
  })

  it('ends marks at a hard break between two atoms', () => {
    const markdown = markdownManager.serialize(
      paragraph([
        atomNode([{ type: 'bold' }]),
        { type: 'hardBreak', marks: [{ type: 'bold' }] },
        atomNode([{ type: 'bold' }]),
      ]),
    )

    expect(markdown).toBe(`**${atom}**  \n**${atom}**`)
  })

  it('marks a hard break inside emphasis without changing the output', () => {
    const json = markdownManager.parse('**a  \nb**')

    expect(json).toEqual(
      paragraph([
        { type: 'text', text: 'a', marks: [{ type: 'bold' }] },
        { type: 'hardBreak', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
      ]),
    )
    expect(markdownManager.serialize(json)).toBe('**a**  \n**b**')
  })

  it.each([`**${atom}**`, `**a ${atom} b**`, `a ${atom} b`])('round trips %s', markdown => {
    expect(markdownManager.serialize(markdownManager.parse(markdown))).toBe(markdown)
  })
})
