/** @jsxImportSource react */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ReactNode } from 'react'
import { Fragment, useRef } from 'react'

import type { Mark } from '@tiptap/pm/model'

import { useEditorContext } from '../contexts/EditorContext.js'
import { useReactKeys } from '../contexts/ReactKeysContext.js'
import { useNodeViewDesc } from '../hooks/useNodeViewDesc.js'
import { MarkView } from './MarkView.js'
import { renderOutputSpec } from './OutputSpecView.js'
import { ReactNodeView } from './ReactNodeView.js'
import { needsTrailingHack, TrailingHackView } from './TrailingHackView.js'

export interface NodeViewProps {
  node: ProseMirrorNode
  /** Absolute document position just before the node. */
  pos: number
}

export interface ChildNodeViewsProps {
  node: ProseMirrorNode
  /** Absolute position of the parent's content start (its first child). */
  innerPos: number
}

/*
 * NodeView and ChildNodeViews are mutually recursive (a node renders its
 * children, which render nodes), so they live in one module.
 */

/**
 * Renders a document node: through the registered React node view component
 * when one exists for the node's type, otherwise from its schema `toDOM`
 * spec. Both paths produce exactly the described elements, no wrapper DOM.
 */
export function NodeView({ node, pos }: NodeViewProps): ReactNode {
  const { nodeViews } = useEditorContext()
  const component = nodeViews[node.type.name]
  const children = node.isLeaf ? undefined : <ChildNodeViews node={node} innerPos={pos + 1} />

  if (component) {
    return (
      <ReactNodeView node={node} pos={pos} component={component}>
        {children}
      </ReactNodeView>
    )
  }
  return (
    <SchemaNodeView node={node} pos={pos}>
      {children}
    </SchemaNodeView>
  )
}

interface SchemaNodeViewProps extends NodeViewProps {
  children?: ReactNode
}

/**
 * The schema-rendered case: a node without a registered component renders
 * from its `toDOM` spec. A layout effect keeps the node's `ViewDesc`
 * registered against the rendered elements.
 */
function SchemaNodeView({ node, children }: SchemaNodeViewProps): ReactNode {
  const domRef = useRef<Element | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  useNodeViewDesc({
    node,
    domRef,
    getContentDOM: () => (node.isLeaf ? null : contentRef.current),
  })

  const spec = node.type.spec.toDOM?.(node)

  if (!spec) {
    throw new RangeError(
      `[tiptap error]: Node type "${node.type.name}" has no toDOM spec and no React node view`,
    )
  }

  return renderOutputSpec(spec, {
    ref: domRef,
    contentRef,
    children,
  })
}

interface OpenMark {
  mark: Mark
  key: string
  children: ReactNode[]
}

/**
 * Renders a node's children. Text children render as bare strings (React
 * creates real DOM text nodes for them — their descs are bound by the parent
 * node's layout effect); everything else renders through `NodeView`. Inline
 * children sharing marks nest inside shared `MarkView` elements, matching
 * ProseMirror's inline DOM shape.
 *
 * Children are keyed by the `reactKeys` plugin state when provided (text runs
 * included, so their DOM text nodes survive sibling insertions), letting
 * React reuse instances across transactions instead of remounting. Without
 * it (static rendering), keys fall back to the index.
 */
export function ChildNodeViews({ node, innerPos }: ChildNodeViewsProps): ReactNode {
  const keys = useReactKeys()
  const top: ReactNode[] = []
  const stack: OpenMark[] = []
  const target = () => (stack.length ? stack[stack.length - 1].children : top)

  const closeToDepth = (depth: number) => {
    while (stack.length > depth) {
      const level = stack.pop() as OpenMark

      target().push(
        <MarkView key={level.key} mark={level.mark}>
          {level.children}
        </MarkView>,
      )
    }
  }

  node.forEach((child, offset, index) => {
    const key = String(keys?.posToKey.get(innerPos + offset) ?? index)
    const marks = child.isInline ? child.marks : []

    // Keep the mark levels shared with the previous child open; close and
    // open the rest (non-spanning marks never merge across children)
    let shared = 0

    while (
      shared < stack.length &&
      shared < marks.length &&
      stack[shared].mark.eq(marks[shared]) &&
      marks[shared].type.spec.spanning !== false
    ) {
      shared += 1
    }
    closeToDepth(shared)
    for (let depth = stack.length; depth < marks.length; depth += 1) {
      stack.push({ mark: marks[depth], key: `${key}-${marks[depth].type.name}`, children: [] })
    }

    if (child.isText) {
      target().push(<Fragment key={key}>{child.text}</Fragment>)
    } else {
      target().push(<NodeView key={key} node={child} pos={innerPos + offset} />)
    }
  })
  closeToDepth(0)

  if (needsTrailingHack(node)) {
    top.push(<TrailingHackView key="trailing-hack" />)
  }

  return <>{top}</>
}
