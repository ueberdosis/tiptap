/**
 * @vitest-environment happy-dom
 */

import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('MarkdownManager Mixed Markdown + HTML', () => {
  let manager: MarkdownManager
  const basicExtensions = [Document, Paragraph, Text, Heading, Italic]

  beforeEach(() => {
    manager = new MarkdownManager({ extensions: basicExtensions })
  })

  it('parses heading with inline HTML <em> as italic', () => {
    const md = '## hello <em>world</em>'
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(Array.isArray(doc.content)).toBe(true)
    const heading = doc.content![0]
    expect(heading.type).toBe('heading')
    // Find the text node that contains 'world'
    const textNodes = heading.content!.flatMap((n: any) => (n.type === 'text' ? [n] : n.content || []))
    const worldNode = textNodes.find((n: any) => n.text && n.text.includes('world'))
    // Use a function-call assertion to avoid the "no-unused-expressions" lint error
    expect(worldNode).not.toBe(undefined)
    // The italic mark should be present
    expect(Array.isArray(worldNode!.marks)).toBe(true)
    const hasItalic = worldNode!.marks.some((m: any) => m.type === 'italic')
    expect(hasItalic).toBe(true)
  })

  it('parses standalone inline HTML <em>world</em> as italic', () => {
    const md = '<em>world</em>'
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    // Inline HTML typically produces a paragraph wrapper
    const paragraph = doc.content![0]
    expect(paragraph.type).toBe('paragraph')
    const textNode = paragraph.content![0]
    expect(textNode.text).toBe('world')
    expect(Array.isArray(textNode.marks)).toBe(true)
    const hasItalic = (textNode.marks || []).some((m: any) => m.type === 'italic')
    expect(hasItalic).toBe(true)
  })

  it('parses markdown italic next to HTML italic correctly', () => {
    const md = '*a* <em>b</em> *c*'
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    const para = doc.content![0]
    expect(para.type).toBe('paragraph')

    // Collect texts and their mark states
    const runs = para.content!.map((n: any) => ({ text: n.text, marks: n.marks || [] }))
    // Expect there to be runs containing a, b, c
    const texts = runs.map(r => (r.text || '').trim())
    expect(texts).toContain('a')
    expect(texts).toContain('b')
    expect(texts).toContain('c')
    ;['a', 'b', 'c'].forEach(letter => {
      const node = runs.find(r => (r.text || '').trim() === letter)
      expect(node).not.toBe(undefined)
      const hasItalic = ((node as any).marks || []).some((m: any) => m.type === 'italic')
      expect(hasItalic).toBe(true)
    })
  })
})
