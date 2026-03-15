import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { MarkdownManager } from '../src/MarkdownManager.js'

describe('Overlapping marks serialization', () => {
  const extensions = [Document, Paragraph, Text, Bold, Italic]
  const markdownManager = new MarkdownManager({ extensions })
  const normalizeMarks = (node: any): any => {
    if (Array.isArray(node)) {
      return node.map(normalizeMarks)
    }

    if (!node || typeof node !== 'object') {
      return node
    }

    return {
      ...node,
      marks: node.marks ? [...node.marks].sort((a, b) => a.type.localeCompare(b.type)) : node.marks,
      content: node.content ? node.content.map(normalizeMarks) : node.content,
    }
  }

  /**
   * Regression test for the original bug report.
   *
   * Steps to reproduce:
   *   1. Toggle bold on
   *   2. Type "123"
   *   3. Toggle italic on
   *   4. Type "456"
   *   5. Toggle bold off
   *   6. Type "789"
   *   7. Toggle italic off
   *
   * Expected: **123*456***<em>789</em>
   * Actual (buggy): **123*456**789*
   */
  it('should correctly serialize overlapping bold and italic marks', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '123',
              marks: [{ type: 'bold' }],
            },
            {
              type: 'text',
              text: '456',
              marks: [{ type: 'bold' }, { type: 'italic' }],
            },
            {
              type: 'text',
              text: '789',
              marks: [{ type: 'italic' }],
            },
          ],
        },
      ],
    }

    const result = markdownManager.serialize(json)

    // The output **123*456**789* is invalid markdown because bold closes
    // while italic is still open, breaking the nesting order.
    // The valid markdown closes the nested italic inside bold first, then
    // reopens the remaining italic segment with inline HTML to avoid ambiguous `***` parsing.
    expect(result).toBe('**123*456***<em>789</em>')
    expect(normalizeMarks(markdownManager.parse(result))).toEqual(normalizeMarks(json))
  })

  /**
   * Mirror of the original bug: italic starts first, bold is added, then italic ends.
   *
   * Steps: italic on → "abc" → bold on → "def" → italic off → "ghi" → bold off
   */
  it('should correctly serialize italic starting before bold', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'abc',
              marks: [{ type: 'italic' }],
            },
            {
              type: 'text',
              text: 'def',
              marks: [{ type: 'italic' }, { type: 'bold' }],
            },
            {
              type: 'text',
              text: 'ghi',
              marks: [{ type: 'bold' }],
            },
          ],
        },
      ],
    }

    const result = markdownManager.serialize(json)

    // italic opens first with *, bold opens inside it, then the remaining bold span
    // reopens with inline HTML after italic closes so the markdown remains unambiguous.
    expect(result).toBe('*abc**def***<strong>ghi</strong>')
    expect(normalizeMarks(markdownManager.parse(result))).toEqual(normalizeMarks(json))
  })

  /**
   * Bold and italic both start and end together on the same node (no overlap).
   */
  it('should correctly serialize bold and italic on the same text', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'hello',
              marks: [{ type: 'bold' }, { type: 'italic' }],
            },
          ],
        },
      ],
    }

    const result = markdownManager.serialize(json)

    // Both marks open and close on the same node — ***hello*** is valid CommonMark for bold+italic
    expect(result).toBe('***hello***')
    expect(normalizeMarks(markdownManager.parse(result))).toEqual(normalizeMarks(json))
  })

  it('keeps html-reopened italic open across later text nodes before closing', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '123', marks: [{ type: 'bold' }] },
            { type: 'text', text: '456', marks: [{ type: 'bold' }, { type: 'italic' }] },
            { type: 'text', text: '789', marks: [{ type: 'italic' }] },
            { type: 'text', text: 'xyz', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' plain' },
          ],
        },
      ],
    }

    const result = markdownManager.serialize(json)

    expect(result).toBe('**123*456***<em>789xyz</em> plain')
    expect(normalizeMarks(markdownManager.parse(result))).toEqual(
      normalizeMarks({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '123', marks: [{ type: 'bold' }] },
              { type: 'text', text: '456', marks: [{ type: 'bold' }, { type: 'italic' }] },
              { type: 'text', text: '789xyz', marks: [{ type: 'italic' }] },
              { type: 'text', text: ' plain' },
            ],
          },
        ],
      }),
    )
  })

  it('closes html-reopened italic correctly before a hard break', () => {
    const markdownManagerWithBreak = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Bold, Italic, HardBreak],
    })
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '123', marks: [{ type: 'bold' }] },
            { type: 'text', text: '456', marks: [{ type: 'bold' }, { type: 'italic' }] },
            { type: 'text', text: '789', marks: [{ type: 'italic' }] },
            { type: 'hardBreak' },
            { type: 'text', text: 'after' },
          ],
        },
      ],
    }

    const result = markdownManagerWithBreak.serialize(json)

    expect(result).toBe('**123*456***<em>789</em>  \nafter')
    expect(normalizeMarks(markdownManagerWithBreak.parse(result))).toEqual(normalizeMarks(json))
  })

  it('does not switch non-bold-italic marks to html reopen mode', () => {
    const markdownManagerWithStrike = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Italic, Strike],
    })
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'abc', marks: [{ type: 'italic' }] },
            { type: 'text', text: 'def', marks: [{ type: 'italic' }, { type: 'strike' }] },
            { type: 'text', text: 'ghi', marks: [{ type: 'strike' }] },
          ],
        },
      ],
    }

    const result = markdownManagerWithStrike.serialize(json)

    expect(result).toBe('*abc~~def~~*~~ghi~~')
    expect(normalizeMarks(markdownManagerWithStrike.parse(result))).toEqual(normalizeMarks(json))
  })
})
