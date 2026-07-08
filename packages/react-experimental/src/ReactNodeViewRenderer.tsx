/** @jsxImportSource react */
import type { NodeViewProps, NodeViewRenderer, NodeViewRendererOptions } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { ComponentType, ElementType, ReactNode, Ref } from 'react'
import { useLayoutEffect, useRef } from 'react'

import type {
  NodeViewComponent,
  NodeViewComponentProps,
} from './components/NodeViewComponentProps.js'
import { useNodeViewContext } from './contexts/NodeViewContext.js'
import { attributesToProps } from './props.js'
import { assignRef } from './refs.js'
import type { ReactNodeViewProps } from './types.js'
import type { ReactNodeViewContextProps } from './useReactNodeView.js'
import { ReactNodeViewContext } from './useReactNodeView.js'

export interface ReactNodeViewRendererOptions extends NodeViewRendererOptions {
  /**
   * Called when the node view is updated, to decide if the component should
   * update. Not supported by the React renderer (updates are memo-driven);
   * providing it logs a one-time warning.
   */
  update:
    | ((props: {
        oldNode: ProseMirrorNode
        oldDecorations: readonly Decoration[]
        oldInnerDecorations: DecorationSource
        newNode: ProseMirrorNode
        newDecorations: readonly Decoration[]
        innerDecorations: DecorationSource
        updateProps: () => void
      }) => boolean)
    | null
  /**
   * The default tag of the `NodeViewWrapper` element (its own `as` prop
   * wins).
   */
  as?: string
  /**
   * Extra class name(s) for the `NodeViewWrapper` element.
   */
  className?: string
  /**
   * Attributes applied to the `NodeViewWrapper` element. A function form is
   * re-evaluated on every render with the current node.
   */
  attrs?:
    | Record<string, string>
    | ((props: {
        node: ProseMirrorNode
        HTMLAttributes: Record<string, any>
      }) => Record<string, string>)
}

const warnedOptions = new Set<string>()

const warnUnsupportedOption = (option: string, typeName: string): void => {
  const key = `${option}:${typeName}`

  if (warnedOptions.has(key)) {
    return
  }
  warnedOptions.add(key)
  console.warn(
    `[tiptap warn]: ReactNodeViewRenderer option "${option}" (on "${typeName}") has no ` +
      'equivalent in the React renderer and is ignored — updates are memo-driven and the ' +
      'content element belongs to the component.',
  )
}

/**
 * Hosts a `@tiptap/react`-contract node view component (props like
 * `node`/`selected`/`updateAttributes`, markup via `NodeViewWrapper` /
 * `NodeViewContent`) under this renderer. Everything is wired over
 * `ReactNodeViewContext`: the wrapper element becomes the node view's DOM,
 * `NodeViewContent` receives the rendered document content, and the
 * `stopEvent`/`ignoreMutation` options register on the node view's handler
 * slots.
 */
export const reactNodeViewComponent = (
  Component: ComponentType<ReactNodeViewProps>,
  options: Partial<ReactNodeViewRendererOptions> = {},
): NodeViewComponent => {
  const NodeViewHost = (props: NodeViewComponentProps): ReactNode => {
    const {
      editor,
      node,
      HTMLAttributes,
      getPos,
      selected,
      decorations,
      innerDecorations,
      updateAttributes,
      deleteNode,
      ref,
      contentDOMRef,
      children,
    } = props
    const { handlersRef } = useNodeViewContext()
    const componentRef = useRef<HTMLElement | null>(null)

    if (options.update) {
      warnUnsupportedOption('update', node.type.name)
    }
    if (options.contentDOMElementTag) {
      warnUnsupportedOption('contentDOMElementTag', node.type.name)
    }

    // Optional handlers go onto the desc's slots; when absent the desc keeps
    // its default behavior (which a registered no-op would mask)
    useLayoutEffect(() => {
      const { stopEvent, ignoreMutation } = options

      if (stopEvent) {
        handlersRef.current.stopEvent = event => stopEvent({ event })
      }
      if (ignoreMutation) {
        handlersRef.current.ignoreMutation = mutation => ignoreMutation({ mutation })
      }
      return () => {
        handlersRef.current.stopEvent = undefined
        handlersRef.current.ignoreMutation = undefined
      }
    }, [handlersRef])

    const resolvedAttrs =
      typeof options.attrs === 'function' ? options.attrs({ node, HTMLAttributes }) : options.attrs
    const attrProps = attributesToProps(resolvedAttrs ?? {})
    const wrapperClassName =
      [options.className, attrProps.className as string | undefined].filter(Boolean).join(' ') ||
      undefined

    // Not memoized: the attrs option can depend on the node, so the value is
    // per-render by design — and the host itself only re-renders when the
    // node changes (the NodeView memo upstream)
    const contextValue: ReactNodeViewContextProps = {
      onDragStart: undefined,
      nodeViewContentRef: element => {
        assignRef(contentDOMRef, element)
      },
      nodeViewContentChildren: children,
      nodeViewWrapperRef: element => {
        componentRef.current = element
        assignRef(ref, element)
      },
      nodeViewWrapperProps: wrapperClassName
        ? { ...attrProps, className: wrapperClassName }
        : attrProps,
      nodeViewWrapperAs: options.as as ElementType | undefined,
    }

    const componentProps: Omit<ReactNodeViewProps, 'ref'> & { ref: Ref<HTMLElement> } = {
      editor,
      node: node as NodeViewProps['node'],
      view: editor.view,
      getPos,
      selected,
      decorations: decorations as NodeViewProps['decorations'],
      innerDecorations,
      HTMLAttributes: HTMLAttributes as NodeViewProps['HTMLAttributes'],
      extension: editor.extensionManager.extensions.find(
        item => item.name === node.type.name,
      ) as NodeViewProps['extension'],
      updateAttributes,
      deleteNode,
      // Components virtually never consume `ref`; the wrapper element
      // arrives through the context instead
      ref: componentRef,
    }

    return (
      <ReactNodeViewContext.Provider value={contextValue}>
        <Component {...(componentProps as ReactNodeViewProps)} />
      </ReactNodeViewContext.Provider>
    )
  }

  NodeViewHost.displayName = `ReactNodeView(${Component.displayName ?? Component.name ?? 'NodeView'})`
  return NodeViewHost
}

/**
 * Marks constructors produced by `ReactNodeViewRenderer`. `Symbol.for`
 * survives duplicate module instances (e.g. a second copy of the package in
 * a bundle).
 */
const REACT_NODE_VIEW_MARKER = Symbol.for('@tiptap/react-experimental/node-view')

export interface ReactNodeViewMarker {
  component: ComponentType<ReactNodeViewProps<any>>
  options: Partial<ReactNodeViewRendererOptions>
}

/** Reads the marker off an `addNodeView()` result, if it carries one. */
export const getReactNodeViewMarker = (renderer: unknown): ReactNodeViewMarker | undefined =>
  (renderer as { [REACT_NODE_VIEW_MARKER]?: ReactNodeViewMarker } | null | undefined)?.[
    REACT_NODE_VIEW_MARKER
  ]

/**
 * The drop-in `ReactNodeViewRenderer`: use it inside an extension's
 * `addNodeView()` exactly like with `@tiptap/react`. This renderer never
 * invokes the returned constructor — `EditorContent` reads the component
 * off a marker and renders it inside the document tree instead. The
 * constructor body only runs under a non-React `EditorView`, where it
 * cannot render anything.
 */
export function ReactNodeViewRenderer<T = HTMLElement>(
  component: ComponentType<ReactNodeViewProps<T>>,
  options: Partial<ReactNodeViewRendererOptions> = {},
): NodeViewRenderer {
  const renderer: NodeViewRenderer = () => {
    console.error(
      '[tiptap warn]: this ReactNodeViewRenderer comes from @tiptap/react-experimental, ' +
        'where node views render through EditorContent — it cannot construct an imperative ' +
        'node view for a non-React EditorView.',
    )
    return {} as unknown as ReturnType<NodeViewRenderer>
  }

  Object.defineProperty(renderer, REACT_NODE_VIEW_MARKER, {
    value: { component, options } satisfies ReactNodeViewMarker,
    enumerable: false,
  })

  return renderer
}
