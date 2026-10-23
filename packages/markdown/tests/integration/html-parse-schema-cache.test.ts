/**
 * @vitest-environment happy-dom
 */

import * as core from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it, vi } from 'vite-plus/test'

describe('MarkdownManager HTML parse schema cache (#8525)', () => {
  const extensions = [Document, Paragraph, Text, HardBreak]

  it('calls getSchema once for HTML parsing across many <br> tokens', () => {
    const spy = vi.spyOn(core, 'getSchema')
    const manager = new MarkdownManager({ extensions })

    // 20 rows with a hard break each — previously paid a full getSchema per <br>.
    const md = Array.from({ length: 20 }, (_, i) => `row ${i}<br>`).join('\n\n')
    const doc = manager.parse(md)

    expect(doc.type).toBe('doc')
    expect(doc.content?.length).toBeGreaterThan(10)

    // getSchemaParseDomTags + htmlParseSchemaCache each call getSchema once.
    // Without the cache, parseHTMLToken would call getSchema once per <br> (~20+).
    expect(spy.mock.calls.length).toBeLessThanOrEqual(3)
    spy.mockRestore()
  })

  it('still parses <br> HTML tokens into hardBreak nodes', () => {
    const manager = new MarkdownManager({ extensions })
    const doc = manager.parse('a<br>b')
    const para = doc.content?.[0]
    expect(para?.type).toBe('paragraph')
    const types = (para?.content || []).map((n: any) => n.type)
    expect(types).toContain('hardBreak')
  })
})
