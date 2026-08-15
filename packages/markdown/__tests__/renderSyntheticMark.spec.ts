import type { JSONContent, MarkdownRendererHelpers, RenderContext } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { renderSyntheticMark } from '../src/utils/renderSyntheticMark.js'

const PLACEHOLDER = '\uE000__TIPTAP_MARKDOWN_PLACEHOLDER__\uE001'

const ctx: RenderContext = { index: 0, level: 0, parentType: 'text', meta: {} }

describe('renderSyntheticMark', () => {
  it('extracts the opening delimiter', () => {
    const renderBold = (node: JSONContent, h: MarkdownRendererHelpers) =>
      `**${h.renderChildren(node)}**`

    expect(renderSyntheticMark(renderBold, 'bold', {}, 'open')).toBe('**')
  })

  it('extracts the closing delimiter', () => {
    const renderBold = (node: JSONContent, h: MarkdownRendererHelpers) =>
      `**${h.renderChildren(node)}**`

    expect(renderSyntheticMark(renderBold, 'bold', {}, 'close')).toBe('**')
  })

  it('extracts delimiters around attributes', () => {
    const renderLink = (node: JSONContent, h: MarkdownRendererHelpers) =>
      `[${h.renderChildren(node)}](${node.attrs?.href})`

    expect(renderSyntheticMark(renderLink, 'link', { href: 'https://example.com' }, 'open')).toBe(
      '[',
    )
    expect(renderSyntheticMark(renderLink, 'link', { href: 'https://example.com' }, 'close')).toBe(
      '](https://example.com)',
    )
  })

  it('returns an empty string when the placeholder is missing from the output', () => {
    const renderWithoutPlaceholder = () => 'no placeholder here'

    expect(renderSyntheticMark(renderWithoutPlaceholder, 'bold', {}, 'open')).toBe('')
    expect(renderSyntheticMark(renderWithoutPlaceholder, 'bold', {}, 'close')).toBe('')
  })

  it('passes the synthetic node and context to the renderer', () => {
    let receivedNode: JSONContent | undefined
    let receivedCtx: RenderContext | undefined

    const spyRenderer = (
      node: JSONContent,
      h: MarkdownRendererHelpers,
      received: RenderContext,
    ) => {
      receivedNode = node
      receivedCtx = received
      return `~${h.renderChildren(node)}~`
    }

    expect(renderSyntheticMark(spyRenderer, 'strike', {}, 'close')).toBe('~')
    expect(receivedNode).toMatchObject({
      type: 'strike',
      content: [{ type: 'text', text: PLACEHOLDER }],
    })
    expect(receivedCtx).toEqual(ctx)
  })

  it('rethrows renderer errors with the mark type in the message', () => {
    const throwingRenderer = () => {
      throw new Error('renderer failed')
    }

    expect(() => renderSyntheticMark(throwingRenderer, 'bold', {}, 'open')).toThrow(
      'Failed to get mark opening for bold: Error: renderer failed',
    )
    expect(() => renderSyntheticMark(throwingRenderer, 'bold', {}, 'close')).toThrow(
      'Failed to get mark closing for bold',
    )
  })
})
