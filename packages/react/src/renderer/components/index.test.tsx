/** @jsxRuntime classic */
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
// JSX pragma needed because vitest aliases `@tiptap/core/jsx-runtime`.

/**
 * Integration test for the read-only component slice.
 *
 * Mounts `<DocNodeView>` with a PM doc fixture and asserts that:
 * - the rendered DOM mirrors the doc structure
 * - the descriptor tree gets built bottom-up under real React lifecycle
 * - the `pmViewDesc` back-pointers wire up correctly
 * - round-trip `posFromDOM(domFromPos(p)) === p` still holds
 */

import { render } from '@testing-library/react'
import { Schema } from '@tiptap/pm/model'
import React from 'react'
import { describe, expect, it } from 'vitest'

import type { ReactNodeViewDesc } from '../viewdesc/index.js'
import { DocNodeView } from './DocNodeView.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    text: { group: 'inline' },
  },
})

function buildDoc() {
  const text = schema.text('hello')
  const paragraph = schema.nodes.paragraph!.create(null, [text])
  return schema.nodes.doc!.create(null, [paragraph])
}

describe('DocNodeView (read-only slice)', () => {
  it('renders the document DOM', () => {
    const { container } = render(<DocNodeView doc={buildDoc()} />)

    const root = container.firstElementChild as HTMLElement
    expect(root.tagName).toBe('DIV')

    const para = root.firstElementChild as HTMLElement
    expect(para.tagName).toBe('P')
    expect(para.textContent).toBe('hello')
  })

  it('builds a descriptor tree that mirrors the doc', () => {
    let docDesc: ReactNodeViewDesc | null = null
    const { container } = render(
      <DocNodeView
        doc={buildDoc()}
        onDocDesc={d => {
          docDesc = d
        }}
      />,
    )

    expect(docDesc).not.toBeNull()
    // doc has 1 paragraph, paragraph has 1 text run.
    expect(docDesc!.children).toHaveLength(1)
    const para = docDesc!.children[0]!
    expect(para.children).toHaveLength(1)

    // Back-pointers on each DOM node match the desc.
    const rootEl = container.firstElementChild as HTMLElement
    const pEl = rootEl.firstElementChild as HTMLElement
    const spanEl = pEl.firstElementChild as HTMLElement
    expect(rootEl.pmViewDesc).toBe(docDesc)
    expect(pEl.pmViewDesc).toBe(para)
    expect(spanEl.pmViewDesc).toBe(para.children[0])
  })

  it('round-trips positions through the rendered tree', () => {
    let docDesc: ReactNodeViewDesc | null = null
    render(
      <DocNodeView
        doc={buildDoc()}
        onDocDesc={d => {
          docDesc = d
        }}
      />,
    )

    // Text "hello" is at positions 1..6 in the doc. For each, going
    // doc-position → DOM → doc-position must return the same position.
    for (let pos = 1; pos <= 6; pos += 1) {
      const { node, offset } = docDesc!.domFromPos(pos, 0)
      expect(docDesc!.posFromDOM(node, offset, 0)).toBe(pos)
    }
  })
})
