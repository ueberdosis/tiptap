/** @jsxImportSource react */
import type { NodeViewProps } from '@tiptap/core'
import type { ComponentType, ReactNode, Ref } from 'react'
import { useLayoutEffect, useMemo, useRef } from 'react'

import type { NodeViewComponentProps } from '../components/NodeViewComponentProps.js'
import type { ReactNodeViewProps } from '../types.js'
import { ReactNodeViewContext } from '../useReactNodeView.js'

const assignRef = <Value,>(ref: Ref<Value> | undefined, value: Value | null): void => {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

/**
 * Runs a legacy `@tiptap/react` node view component (one written for
 * `ReactNodeViewRenderer`, rendering `NodeViewWrapper` / `NodeViewContent`)
 * under the experimental renderer:
 *
 * - The legacy `ReactNodeViewContext` is provided with this renderer's
 *   values: `NodeViewContent`'s ref becomes `contentDOMRef`, its children
 *   become the rendered document content.
 * - The `NodeViewWrapper` element becomes the node view's element. Legacy
 *   components never forward a ref to it, so it is located after each commit
 *   through a hidden marker sibling — the marker stays out of the desc tree
 *   and out of selection (`display: none`, non-editable).
 *
 * Supported: the declarative `NodeViewWrapper`/`NodeViewContent` subset —
 * the common shape of published node view components. Not supported (use
 * the native contract instead): `ReactNodeViewRenderer` options
 * (`stopEvent`, `ignoreMutation`, `contentDOMElementTag`, …), the legacy
 * `onDragStart` drag-image behavior, and arbitrary imperative `NodeView`
 * constructors.
 *
 * ```ts
 * <EditorContent editor={editor} nodeViews={{ myNode: bridgeReactNodeView(LegacyComponent) }} />
 * ```
 */
export const bridgeReactNodeView = (
  LegacyComponent: ComponentType<ReactNodeViewProps>,
): ComponentType<NodeViewComponentProps> => {
  const BridgedNodeView = (props: NodeViewComponentProps): ReactNode => {
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
    const markerRef = useRef<HTMLSpanElement | null>(null)
    const wrapperRef = useRef<HTMLElement | null>(null)

    // Locate the legacy wrapper element (the marker's previous sibling) and
    // hand it to the node view ref. Runs before the parent ReactNodeView's
    // desc effect (child effects first), so mapping sees it immediately.
    useLayoutEffect(() => {
      const wrapper = (markerRef.current?.previousElementSibling ?? null) as HTMLElement | null

      if (!wrapper) {
        console.error(
          `[tiptap warn]: bridgeReactNodeView could not locate the NodeViewWrapper element for "${node.type.name}". ` +
            'The legacy component must render exactly one wrapper element.',
        )
      }
      if (wrapper !== wrapperRef.current) {
        wrapperRef.current = wrapper
        assignRef(ref, wrapper)
      }
    })

    useLayoutEffect(
      () => () => {
        assignRef(ref, null)
      },
      [ref],
    )

    // The legacy NodeViewContent reads its ref and children from this context
    const contextValue = useMemo(
      () => ({
        onDragStart: undefined,
        nodeViewContentRef: (element: HTMLElement | null) => {
          assignRef(contentDOMRef, element)
        },
        nodeViewContentChildren: children,
      }),
      [contentDOMRef, children],
    )

    const legacyProps: Omit<ReactNodeViewProps, 'ref'> & { ref: Ref<HTMLElement> } = {
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
      // Legacy components virtually never consume `ref`; the wrapper is
      // located through the marker instead
      ref: wrapperRef,
    }

    return (
      <ReactNodeViewContext.Provider value={contextValue}>
        <LegacyComponent {...(legacyProps as ReactNodeViewProps)} />
        <span
          ref={markerRef}
          style={{ display: 'none' }}
          contentEditable={false}
          aria-hidden="true"
          data-bridge-marker=""
        />
      </ReactNodeViewContext.Provider>
    )
  }

  BridgedNodeView.displayName = `Bridged(${LegacyComponent.displayName ?? LegacyComponent.name ?? 'NodeView'})`
  return BridgedNodeView
}
