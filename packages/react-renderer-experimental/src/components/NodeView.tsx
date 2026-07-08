/** @jsxImportSource react */
import type { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { NodeSelection } from '@tiptap/pm/state'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { ReactNode } from 'react'
import { Fragment, memo, useRef } from 'react'

import { useEditorContext } from '../contexts/EditorContext.js'
import { useRenderState } from '../contexts/ReactKeysContext.js'
import { iterDeco } from '../decorations/iterDeco.js'
import { sourceLocals, widgetSide } from '../decorations/internals.js'
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
  /**
   * Absolute document position just before the node. Fresh whenever the
   * component renders (the parent recomputed it), but a memo-skipped
   * component holds a stale value — resolve positions through the desc tree
   * (`getPos`) outside of render.
   */
  pos: number
  /** Decorations rendered onto the node's own element. */
  outerDeco: readonly Decoration[]
  /** Decorations for the node's content. */
  innerDeco: DecorationSource
  /** Whether the node itself is node-selected. */
  selected: boolean
  /** Whether a node selection starts inside this node's range. */
  selectionInside: boolean
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
function NodeViewComponent({
  node,
  pos,
  outerDeco,
  innerDeco,
  selected,
  selectionInside,
}: NodeViewProps): ReactNode {
  const { nodeViews } = useEditorContext()
  const component = nodeViews[node.type.name]
  const children = node.isLeaf ? undefined : (
    <ChildNodeViews node={node} innerPos={pos + 1} innerDeco={innerDeco} />
  )

  void selectionInside

  if (component) {
    return (
      <ReactNodeView
        node={node}
        selected={selected}
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

/**
 * Typing must not be O(document): unchanged nodes skip re-rendering
 * entirely. Thanks to ProseMirror's structural sharing, an unchanged
 * subtree keeps its node object identity, so identity comparison is exact.
 * `pos` is deliberately NOT compared — positions shift for every node after
 * an edit, and nothing consumes `pos` outside of render (see NodeViewProps).
 * `selectionInside` re-renders the path to a moved node selection.
 */
export const NodeView = memo(
  NodeViewComponent,
  (prev, next) =>
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.selectionInside === next.selectionInside &&
    prev.outerDeco === next.outerDeco &&
    prev.innerDeco === next.innerDeco,
)

interface SchemaNodeViewProps extends Omit<NodeViewProps, 'selected' | 'selectionInside'> {
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
const CHUNK_SIZE = 128
const CHUNK_THRESHOLD = 256

interface NodeChunkProps {
  nodes: ProseMirrorNode[]
  /** Absolute position before the first node (stale when memo-skipped). */
  startPos: number
  /** Content-relative offset of the first node (for forChild). */
  startOffset: number
  innerDeco: DecorationSource
  /** Whether a node selection starts inside this chunk's range. */
  selectionInside: boolean
}

/** Renders one chunk of block children (no marks, no local decorations). */
function NodeChunkComponent({
  nodes,
  startPos,
  startOffset,
  innerDeco,
  selectionInside,
}: NodeChunkProps): ReactNode {
  const { keys, selection } = useRenderState()
  const nodeSelection = selectionInside && selection instanceof NodeSelection ? selection : null
  const children: ReactNode[] = []
  let pos = startPos
  let offset = startOffset

  nodes.forEach((child, index) => {
    const childSelectionInside =
      nodeSelection !== null &&
      nodeSelection.from >= pos &&
      nodeSelection.from < pos + child.nodeSize

    children.push(
      <NodeView
        key={String(keys?.posToKey.get(pos) ?? index)}
        node={child}
        pos={pos}
        outerDeco={NO_OUTER_DECO}
        innerDeco={innerDeco.forChild(offset, child)}
        selected={childSelectionInside && nodeSelection.from === pos}
        selectionInside={childSelectionInside}
      />,
    )
    pos += child.nodeSize
    offset += child.nodeSize
  })

  return <>{children}</>
}

const NO_OUTER_DECO: readonly Decoration[] = []

/**
 * Chunks skip re-rendering when none of their nodes changed — without this,
 * a keystroke in a 10k-block document would re-create 10k elements just for
 * memoized NodeViews to discard. Positions are deliberately not compared
 * (see NodeView); a chunk re-renders when a node changes, when a node
 * selection enters/leaves it, or when the content decorations change.
 */
const NodeChunk = memo(
  NodeChunkComponent,
  (prev, next) =>
    prev.nodes.length === next.nodes.length &&
    prev.selectionInside === next.selectionInside &&
    prev.innerDeco === next.innerDeco &&
    prev.nodes.every((node, index) => node === next.nodes[index]),
)

/**
 * Whether a node's children can render through the chunked fast path:
 * block-only content, no local decorations, no marks on the blocks. The
 * general path (iterDeco + mark stack) handles everything else.
 */
const chunkable = (node: ProseMirrorNode, locals: readonly Decoration[]): boolean => {
  if (node.inlineContent || node.childCount < CHUNK_THRESHOLD || locals.length > 0) {
    return false
  }
  for (let i = 0; i < node.childCount; i += 1) {
    if (node.child(i).marks.length > 0) {
      return false
    }
  }
  return true
}

function ChunkedChildNodeViews({ node, innerPos, innerDeco }: ChildNodeViewsProps): ReactNode {
  const chunks: ReactNode[] = []
  const { selection } = useRenderState()
  const nodeSelection = selection instanceof NodeSelection ? selection : null

  let index = 0
  let pos = innerPos
  let offset = 0

  while (index < node.childCount) {
    const nodes: ProseMirrorNode[] = []
    const startPos = pos
    const startOffset = offset

    for (let i = 0; i < CHUNK_SIZE && index < node.childCount; i += 1, index += 1) {
      const child = node.child(index)

      nodes.push(child)
      pos += child.nodeSize
      offset += child.nodeSize
    }

    const selectionInside =
      nodeSelection !== null && nodeSelection.from >= startPos && nodeSelection.from < pos

    chunks.push(
      <NodeChunk
        key={`chunk-${chunks.length}`}
        nodes={nodes}
        startPos={startPos}
        startOffset={startOffset}
        innerDeco={innerDeco}
        selectionInside={selectionInside}
      />,
    )
  }

  return <>{chunks}</>
}

export function ChildNodeViews(props: ChildNodeViewsProps): ReactNode {
  const locals = sourceLocals(props.innerDeco, props.node)

  if (chunkable(props.node, locals)) {
    return <ChunkedChildNodeViews {...props} />
  }
  return <FlatChildNodeViews {...props} />
}

function FlatChildNodeViews({ node, innerPos, innerDeco }: ChildNodeViewsProps): ReactNode {
  const { keys, selection } = useRenderState()
  const nodeSelection = selection instanceof NodeSelection ? selection : null
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
      const selectionInside =
        nodeSelection !== null &&
        nodeSelection.from >= childPos &&
        nodeSelection.from < childPos + child.nodeSize

      marks
        .target()
        .push(
          <NodeView
            key={key}
            node={child}
            pos={childPos}
            outerDeco={outerDeco}
            innerDeco={childInnerDeco}
            selected={selectionInside && nodeSelection.from === childPos}
            selectionInside={selectionInside}
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
