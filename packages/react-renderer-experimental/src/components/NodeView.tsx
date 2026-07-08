/** @jsxImportSource react */
import type { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { ReactNode } from 'react'
import { Fragment, useRef } from 'react'

import { useEditorContext } from '../contexts/EditorContext.js'
import { useReactKeys } from '../contexts/ReactKeysContext.js'
import { iterDeco } from '../decorations/iterDeco.js'
import { widgetSide } from '../decorations/internals.js'
import { mergeElementDecoAttrs } from '../decorations/outerDeco.js'
import { useNodeViewDesc } from '../hooks/useNodeViewDesc.js'
import { attributesToProps } from '../props.js'
import { DecoratedText } from './DecoratedText.js'
import { MarkView } from './MarkView.js'
import { renderOutputSpec } from './OutputSpecView.js'
import { ReactNodeView } from './ReactNodeView.js'
import { needsTrailingHack, TrailingHackView } from './TrailingHackView.js'
import { WidgetView } from './WidgetView.js'

export interface NodeViewProps {
  node: ProseMirrorNode
  /** Absolute document position just before the node. */
  pos: number
  /** Decorations rendered onto the node's own element. */
  outerDeco: readonly Decoration[]
  /** Decorations for the node's content. */
  innerDeco: DecorationSource
}

export interface ChildNodeViewsProps {
  node: ProseMirrorNode
  /** Absolute position of the parent's content start (its first child). */
  innerPos: number
  /** Decorations local to the parent's content. */
  innerDeco: DecorationSource
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
export function NodeView({ node, pos, outerDeco, innerDeco }: NodeViewProps): ReactNode {
  const { nodeViews } = useEditorContext()
  const component = nodeViews[node.type.name]
  const children = node.isLeaf ? undefined : (
    <ChildNodeViews node={node} innerPos={pos + 1} innerDeco={innerDeco} />
  )

  if (component) {
    return (
      <ReactNodeView
        node={node}
        pos={pos}
        outerDeco={outerDeco}
        innerDeco={innerDeco}
        component={component}
      >
        {children}
      </ReactNodeView>
    )
  }
  return (
    <SchemaNodeView node={node} pos={pos} outerDeco={outerDeco} innerDeco={innerDeco}>
      {children}
    </SchemaNodeView>
  )
}

interface SchemaNodeViewProps extends NodeViewProps {
  children?: ReactNode
}

/**
 * The schema-rendered case: a node without a registered component renders
 * from its `toDOM` spec, with node/inline decorations merged into its
 * element's attributes. A layout effect keeps the node's `ViewDesc`
 * registered against the rendered elements.
 */
function SchemaNodeView({ node, outerDeco, innerDeco, children }: SchemaNodeViewProps): ReactNode {
  const domRef = useRef<Element | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  useNodeViewDesc({
    node,
    domRef,
    getContentDOM: () => (node.isLeaf ? null : contentRef.current),
    outerDeco,
    innerDeco,
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
    rootProps: outerDeco.length ? attributesToProps(mergeElementDecoAttrs(outerDeco)) : undefined,
  })
}

interface OpenMark {
  mark: Mark
  key: string
  children: ReactNode[]
}

/**
 * Tracks the currently open mark elements while children are emitted, so
 * inline children sharing marks nest inside shared `MarkView` elements
 * (ProseMirror's inline DOM shape). `syncTo` keeps the mark levels shared
 * with the previous child open and closes/opens the rest; non-spanning
 * marks never merge across children.
 */
const createMarkStack = (top: ReactNode[]) => {
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

  const syncTo = (marks: readonly Mark[], key: string) => {
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
  }

  return { target, syncTo, closeAll: () => closeToDepth(0) }
}

/**
 * Renders a node's children interleaved with its local decorations, via the
 * derived `iterDeco`: widgets appear at their positions (ordered by `side`),
 * text runs split at inline-decoration boundaries. Undecorated text renders
 * as bare strings (their descs are bound by the parent node's layout
 * effect); decorated runs render through `DecoratedText`, which registers
 * its own desc. Inline children sharing marks nest inside shared `MarkView`
 * elements, matching ProseMirror's inline DOM shape.
 *
 * Children are keyed by the `reactKeys` plugin state when provided, letting
 * React reuse instances across transactions instead of remounting. Without
 * it (static rendering), keys fall back to the index.
 */
export function ChildNodeViews({ node, innerPos, innerDeco }: ChildNodeViewsProps): ReactNode {
  const keys = useReactKeys()
  const top: ReactNode[] = []
  const marks = createMarkStack(top)

  let offset = 0

  const onWidget = (widget: Decoration) => {
    const specKey = widget.spec.key
    const key =
      typeof specKey === 'string'
        ? specKey
        : `widget:${innerPos + offset}:${widgetSide(widget)}:${marks.target().length}`

    marks.target().push(<WidgetView key={key} widget={widget} pos={innerPos + offset} />)
  }

  const onNode = (
    child: ProseMirrorNode,
    outerDeco: readonly Decoration[],
    childInnerDeco: DecorationSource,
    index: number,
  ) => {
    const childPos = innerPos + offset
    const mappedKey = keys?.posToKey.get(childPos)
    const key = String(mappedKey ?? (index === -1 ? `slice:${offset}` : index))

    marks.syncTo(child.isInline ? child.marks : [], key)

    if (!child.isText) {
      marks
        .target()
        .push(
          <NodeView
            key={key}
            node={child}
            pos={childPos}
            outerDeco={outerDeco}
            innerDeco={childInnerDeco}
          />,
        )
    } else if (outerDeco.length) {
      marks.target().push(<DecoratedText key={key} slice={child} deco={outerDeco} />)
    } else {
      marks.target().push(<Fragment key={key}>{child.text}</Fragment>)
    }
    offset += child.nodeSize
  }

  iterDeco(node, innerDeco, onWidget, onNode)
  marks.closeAll()

  if (needsTrailingHack(node)) {
    top.push(<TrailingHackView key="trailing-hack" />)
  }

  return <>{top}</>
}
