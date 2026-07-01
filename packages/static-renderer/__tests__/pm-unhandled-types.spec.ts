import { render } from '@testing-library/react'
import type { JSONContent } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string'
import { renderToMarkdown } from '@tiptap/static-renderer/pm/markdown'
import { renderToReactElement } from '@tiptap/static-renderer/pm/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

const extensions = [Document, Paragraph, Text, Bold, Heading]

// `calloutBox` is not in the schema above.
const docWithUnknownNode = {
  type: 'doc',
  content: [
    { type: 'calloutBox', attrs: { variant: 'info' }, content: [{ type: 'text', text: 'hi' }] },
  ],
}

// `colorMark` is not in the schema above.
const docWithUnknownMark = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'hi', marks: [{ type: 'colorMark', attrs: {} }] }],
    },
  ],
}

describe('static renderer: unhandledNode / unhandledMark for unknown schema types', () => {
  it('react: routes an unknown node to unhandledNode instead of throwing', () => {
    const view = render(
      renderToReactElement({
        content: docWithUnknownNode,
        extensions,
        options: {
          unhandledNode: () => React.createElement('div', { 'data-unhandled-node': 'true' }),
        },
      }),
    )

    expect(view.container.querySelector('[data-unhandled-node]')).not.toBeNull()
  })

  it('react: routes an unknown mark to unhandledMark instead of throwing', () => {
    const view = render(
      renderToReactElement({
        content: docWithUnknownMark,
        extensions,
        options: {
          unhandledMark: ({ children }) => React.createElement('mark', {}, children),
        },
      }),
    )

    expect(view.container.querySelector('mark')?.textContent).toBe('hi')
  })

  it('react: still throws for an unknown node when no fallback is provided', () => {
    expect(() => renderToReactElement({ content: docWithUnknownNode, extensions })).toThrow(
      /Unknown node type: calloutBox/,
    )
  })

  it('react: re-throws the original error when the unknown node has no matching fallback', () => {
    // Only `unhandledMark` is provided, but the unknown type is a node — the
    // clear "Unknown node type" error must still surface instead of falling back.
    expect(() =>
      renderToReactElement({
        content: docWithUnknownNode,
        extensions,
        options: { unhandledMark: ({ children }) => React.createElement('mark', {}, children) },
      }),
    ).toThrow(/Unknown node type: calloutBox/)
  })

  it('does not mask non-unknown-type schema errors even when a fallback is set', () => {
    const malformed = {
      type: 'doc',
      // text node without a `text` string — all types are known, so this is a
      // structural error, not an unknown-type one. It must still throw.
      content: [{ type: 'paragraph', content: [{ type: 'text' }] }],
    }

    expect(() =>
      renderToReactElement({
        content: malformed,
        extensions,
        options: { unhandledNode: () => React.createElement('div') },
      }),
    ).toThrow(/Invalid text node in JSON/)
  })

  it('html-string: routes an unknown node to unhandledNode instead of throwing', () => {
    const html = renderToHTMLString({
      content: docWithUnknownNode,
      extensions,
      options: { unhandledNode: () => '<div data-unhandled-node></div>' },
    })

    expect(html).toContain('data-unhandled-node')
  })

  it('preserves the happy path for fully-known content', () => {
    const html = renderToHTMLString({
      content: {
        type: 'doc',
        content: [{ type: 'heading', content: [{ type: 'text', text: 'x' }] }],
      },
      extensions,
    })

    expect(html).toBe('<h1>x</h1>')
  })
})

describe('static renderer: unknown types preserve known nodes (sentinel substitution)', () => {
  it('hands the original type and attributes to unhandledNode', () => {
    let seenType: string | undefined
    let seenVariant: unknown

    render(
      renderToReactElement({
        content: docWithUnknownNode,
        extensions,
        options: {
          unhandledNode: ({ node }) => {
            seenType = node.type.name
            seenVariant = node.attrs.variant
            return React.createElement('div')
          },
        },
      }),
    )

    expect(seenType).toBe('calloutBox')
    expect(seenVariant).toBe('info')
  })

  it('hands the original type to unhandledMark', () => {
    let seenType: string | undefined

    render(
      renderToReactElement({
        content: docWithUnknownMark,
        extensions,
        options: {
          unhandledMark: ({ mark, children }) => {
            seenType = mark.type.name
            return React.createElement('mark', {}, children)
          },
        },
      }),
    )

    expect(seenType).toBe('colorMark')
  })

  it('renders known nodes with their schema attribute defaults alongside an unknown node', () => {
    // The heading carries no explicit `level`; it must still resolve to its
    // default (<h1>) rather than losing the attribute and crashing.
    const view = render(
      renderToReactElement({
        content: {
          type: 'doc',
          content: [
            { type: 'heading', content: [{ type: 'text', text: 'title' }] },
            { type: 'calloutBox', content: [{ type: 'text', text: 'x' }] },
          ],
        },
        extensions,
        options: { unhandledNode: () => React.createElement('aside') },
      }),
    )

    expect(view.container.querySelector('h1')?.textContent).toBe('title')
    expect(view.container.querySelector('aside')).not.toBeNull()
  })

  it('keeps markdown output correct for known nodes when an unknown node is present', () => {
    const markdown = renderToMarkdown({
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'b' }] }],
              },
            ],
          },
          { type: 'calloutBox', content: [{ type: 'text', text: 'note' }] },
        ],
      },
      extensions: [StarterKit],
      options: { unhandledNode: ({ children }) => `\n[callout]${children}\n` },
    })

    expect(markdown).toContain('- a')
    expect(markdown).toContain('- b')
    expect(markdown).toContain('[callout]')
  })

  it('routes an unknown mark to unhandledMark in markdown output', () => {
    let seenMark: string | undefined

    const markdown = renderToMarkdown({
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'hi', marks: [{ type: 'colorMark', attrs: {} }] }],
          },
        ],
      },
      extensions: [StarterKit],
      options: {
        unhandledMark: ({ mark, children }) => {
          seenMark = mark.type.name
          return `[[${children}]]`
        },
      },
    })

    expect(markdown).toContain('[[hi]]')
    expect(seenMark).toBe('colorMark')
  })

  it('still throws a structural error when an unknown-with-fallback type is also present', () => {
    // A genuinely malformed known node (text without `text`) must not be masked
    // just because the document also contains a handled unknown node.
    expect(() =>
      render(
        renderToReactElement({
          content: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text' }] },
              { type: 'calloutBox', content: [{ type: 'text', text: 'x' }] },
            ],
          },
          extensions,
          options: { unhandledNode: () => React.createElement('div') },
        }),
      ),
    ).toThrow(/Invalid text node in JSON/)
  })

  it('restores the original JSON when a fallback calls node.toJSON()', () => {
    let dumped: JSONContent | undefined

    render(
      renderToReactElement({
        content: {
          type: 'doc',
          content: [
            {
              type: 'calloutBox',
              attrs: { variant: 'info' },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'deep', marks: [{ type: 'colorMark', attrs: { c: 1 } }] },
                  ],
                },
              ],
            },
          ],
        },
        extensions,
        options: {
          unhandledNode: ({ node }) => {
            dumped = node.toJSON()
            return React.createElement('div')
          },
          unhandledMark: ({ children }) => React.createElement('mark', {}, children),
        },
      }),
    )

    // The unknown node serializes back to its original type/attrs, with no
    // placeholder leakage — including a nested unknown mark deeper in the tree.
    expect(dumped?.type).toBe('calloutBox')
    expect(dumped?.attrs).toEqual({ variant: 'info' })
    const text = dumped?.content?.[0]?.content?.[0]
    expect(text?.text).toBe('deep')
    expect(text?.marks?.[0]).toEqual({ type: 'colorMark', attrs: { c: 1 } })
  })
})
