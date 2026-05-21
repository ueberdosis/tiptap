/** @jsxRuntime classic */
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
// JSX pragma needed: the repo's vitest aliases `@tiptap/core/jsx-runtime`,
// which doesn't drive React's hook dispatcher. Production builds use the
// automatic React runtime from tsconfig.json and don't need this.

import { act, render } from '@testing-library/react'
import { Schema } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'
import React, { useRef } from 'react'
import { describe, expect, it } from 'vitest'

import { ChildDescriptionsContext } from '../contexts/ChildDescriptionsContext.js'
import type { ReactNodeViewDesc, ReactViewDesc } from '../viewdesc/index.js'
import { useChildDescriptions } from './useChildDescriptions.js'
import { useNodeViewDescription } from './useNodeViewDescription.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    text: { group: 'inline' },
  },
})

/** Component under test: one paragraph node-view. */
function TestNodeView(props: {
  node: ReturnType<typeof schema.nodes.paragraph.create>
  index: number
  onDesc?: (desc: ReactNodeViewDesc | null) => void
}) {
  const domRef = useRef<HTMLParagraphElement>(null)
  const contentDOMRef = useRef<HTMLParagraphElement>(null)
  const { childContext, descRef } = useNodeViewDescription({
    node: props.node,
    outerDeco: [],
    innerDeco: DecorationSet.empty,
    domRef,
    contentDOMRef,
    index: props.index,
  })

  React.useEffect(() => {
    props.onDesc?.(descRef.current)
  })

  return (
    <ChildDescriptionsContext.Provider value={childContext}>
      <p
        ref={node => {
          domRef.current = node
          contentDOMRef.current = node
        }}
      />
    </ChildDescriptionsContext.Provider>
  )
}

/** Parent provider — owns the registry the children register into. */
function TestRoot(props: { children: React.ReactNode; onRegistry?: (ref: { current: ReactViewDesc[] }) => void }) {
  const { childrenRef, value } = useChildDescriptions()
  React.useEffect(() => {
    props.onRegistry?.(childrenRef)
  })
  return <ChildDescriptionsContext.Provider value={value}>{props.children}</ChildDescriptionsContext.Provider>
}

describe('useNodeViewDescription', () => {
  it('creates a desc on first commit and registers it with the parent', () => {
    const paragraph = schema.nodes.paragraph!.create()
    let registry: { current: ReactViewDesc[] } | undefined
    let desc: ReactNodeViewDesc | null = null

    render(
      <TestRoot
        onRegistry={r => {
          registry = r
        }}
      >
        <TestNodeView
          node={paragraph}
          index={0}
          onDesc={d => {
            desc = d
          }}
        />
      </TestRoot>,
    )

    expect(desc).not.toBeNull()
    expect(registry!.current).toHaveLength(1)
    expect(registry!.current[0]).toBe(desc)
    expect(desc!.node).toBe(paragraph)
  })

  it('keeps desc identity stable across re-renders and updates fields in place', () => {
    const paragraph = schema.nodes.paragraph!.create()
    const next = schema.nodes.paragraph!.create()
    let desc: ReactNodeViewDesc | null = null

    const { rerender } = render(
      <TestRoot>
        <TestNodeView
          node={paragraph}
          index={0}
          onDesc={d => {
            desc = d
          }}
        />
      </TestRoot>,
    )
    const first = desc

    act(() => {
      rerender(
        <TestRoot>
          <TestNodeView
            node={next}
            index={0}
            onDesc={d => {
              desc = d
            }}
          />
        </TestRoot>,
      )
    })

    expect(desc).toBe(first)
    expect(desc!.node).toBe(next)
  })

  it('writes the pmViewDesc back-pointer onto the DOM', () => {
    const paragraph = schema.nodes.paragraph!.create()
    let desc: ReactNodeViewDesc | null = null

    render(
      <TestRoot>
        <TestNodeView
          node={paragraph}
          index={0}
          onDesc={d => {
            desc = d
          }}
        />
      </TestRoot>,
    )

    expect(desc!.dom.pmViewDesc).toBe(desc)
  })

  it('unregisters and destroys the desc on unmount', () => {
    const paragraph = schema.nodes.paragraph!.create()
    let registry: { current: ReactViewDesc[] } | undefined
    let desc: ReactNodeViewDesc | null = null

    const { unmount } = render(
      <TestRoot
        onRegistry={r => {
          registry = r
        }}
      >
        <TestNodeView
          node={paragraph}
          index={0}
          onDesc={d => {
            desc = d
          }}
        />
      </TestRoot>,
    )

    expect(registry!.current).toHaveLength(1)
    const capturedDom = desc!.dom
    unmount()
    expect(registry!.current).toHaveLength(0)
    expect(capturedDom.pmViewDesc).toBeUndefined()
  })

  it('orders multiple siblings by their declared index', () => {
    const a = schema.nodes.paragraph!.create()
    const b = schema.nodes.paragraph!.create()
    const c = schema.nodes.paragraph!.create()
    let registry: { current: ReactViewDesc[] } | undefined

    render(
      <TestRoot
        onRegistry={r => {
          registry = r
        }}
      >
        <TestNodeView node={a} index={0} />
        <TestNodeView node={b} index={1} />
        <TestNodeView node={c} index={2} />
      </TestRoot>,
    )

    expect(registry!.current.map(d => d.node)).toEqual([a, b, c])
  })
})
