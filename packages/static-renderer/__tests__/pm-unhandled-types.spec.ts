import { render } from '@testing-library/react'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string'
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
