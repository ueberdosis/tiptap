import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { BlockMath, InlineMath } from '@tiptap/extension-mathematics'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

const collectTypes = (node: any): string[] => [
  node.type,
  ...(node.content || []).flatMap(collectTypes),
]

describe('escaped dollar signs stay text when mathematics is loaded', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Code, CodeBlock, InlineMath, BlockMath],
  })

  it('keeps an escaped inline dollar pair as text across a round trip', () => {
    const input = 'The variable \\$x\\$ is a placeholder.'
    const json = markdownManager.parse(input)

    expect(collectTypes(json)).not.toContain('inlineMath')
    expect(json.content?.[0].content).toEqual([
      { type: 'text', text: 'The variable $x$ is a placeholder.' },
    ])

    const serialized = markdownManager.serialize(json)

    expect(serialized).toBe(input)
    expect(markdownManager.parse(serialized)).toEqual(json)
    expect(markdownManager.serialize(markdownManager.parse(serialized))).toBe(input)
  })

  it('keeps an escaped block dollar pair as text across a round trip', () => {
    const input = 'The variable \\$\\$x\\$\\$ is a placeholder.'
    const json = markdownManager.parse(input)

    expect(collectTypes(json)).not.toContain('blockMath')
    expect(collectTypes(json)).not.toContain('inlineMath')
    expect(json.content?.[0].content?.[0].text).toBe('The variable $$x$$ is a placeholder.')
    expect(markdownManager.serialize(json)).toBe(input)
    expect(markdownManager.parse(markdownManager.serialize(json))).toEqual(json)
  })

  it('still serializes real math nodes with dollar delimiters', () => {
    const inline = markdownManager.parse('The value is $x$ here.')

    expect(collectTypes(inline)).toContain('inlineMath')
    expect(markdownManager.serialize(inline)).toBe('The value is $x$ here.')
    expect(markdownManager.parse(markdownManager.serialize(inline))).toEqual(inline)

    const block = markdownManager.parse('$$\nx\n$$')

    expect(collectTypes(block)).toContain('blockMath')

    const serialized = markdownManager.serialize(block)

    expect(serialized).not.toContain('\\$')
    expect(collectTypes(markdownManager.parse(serialized))).toContain('blockMath')
  })

  it('does not escape dollar signs inside inline code or code blocks', () => {
    expect(
      markdownManager.serialize({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '$x$', marks: [{ type: 'code' }] }],
          },
        ],
      }),
    ).toBe('`$x$`')

    expect(
      markdownManager.serialize({
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: { language: null },
            content: [{ type: 'text', text: '$x$' }],
          },
        ],
      }),
    ).toBe('```\n$x$\n```')
  })
})
