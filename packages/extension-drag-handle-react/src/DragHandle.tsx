import {
  type DragHandlePluginProps,
  type NestedOptions,
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
  normalizeNestedOptions,
} from '@tiptap/extension-drag-handle'
import type { Node } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/react'
import { type ReactNode, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<
  Optional<DragHandlePluginProps, 'pluginKey'>,
  'element' | 'nestedOptions'
> & {
  className?: string
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void
  children: ReactNode

  /**
   * Enable drag handles for nested content (list items, blockquotes, etc.).
   *
   * When enabled, the drag handle will appear for nested blocks, not just
   * top-level blocks. A rule-based scoring system determines which node
   * to target based on cursor position and configured rules.
   *
   * @default false
   *
   * @example
   * // Simple enable with sensible defaults
   * <DragHandle editor={editor} nested>
   *   <GripIcon />
   * </DragHandle>
   *
   * @example
   * // With custom configuration
   * <DragHandle
   *   editor={editor}
   *   nested={{
   *     edgeDetection: 'left',
   *     allowedContainers: ['bulletList', 'orderedList'],
   *   }}
   * >
   *   <GripIcon />
   * </DragHandle>
   *
   * @example
   * // With custom rules
   * <DragHandle
   *   editor={editor}
   *   nested={{
   *     rules: [{
   *       id: 'excludeCodeBlocks',
   *       evaluate: ({ node }) => node.type.name === 'codeBlock' ? 1000 : 0,
   *     }],
   *   }}
   * >
   *   <GripIcon />
   * </DragHandle>
   */
  nested?: boolean | NestedOptions
}

export const DragHandle = (props: DragHandleProps) => {
  const {
    className = 'drag-handle',
    children,
    editor,
    pluginKey = dragHandlePluginDefaultKey,
    onNodeChange,
    onElementDragStart,
    onElementDragEnd,
    getReferencedVirtualElement,
    computePositionConfig = defaultComputePositionConfig,
    nested = false,
  } = props
  const elementRef = useRef<HTMLDivElement | null>(null)

  if (elementRef.current === null && typeof document !== 'undefined') {
    elementRef.current = document.createElement('div')
  }

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const nestedOptions = useMemo(() => normalizeNestedOptions(nested), [JSON.stringify(nested)])

  useEffect(() => {
    const element = elementRef.current
    if (!element) {
      return
    }

    element.className = className
  }, [className])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    if (editor.isDestroyed) {
      return
    }

    const element = elementRef.current
    if (!element) {
      return
    }

    element.style.visibility = 'hidden'
    element.style.position = 'absolute'
    element.dataset.dragging = 'false'

    const { plugin, unbind } = DragHandlePlugin({
      editor,
      element,
      pluginKey,
      computePositionConfig: {
        ...defaultComputePositionConfig,
        ...computePositionConfig,
      },
      onElementDragStart,
      onElementDragEnd,
      onNodeChange,
      getReferencedVirtualElement,
      nestedOptions,
    })

    editor.registerPlugin(plugin)

    return () => {
      if (!editor.isDestroyed) {
        editor.unregisterPlugin(pluginKey)
      }
      unbind()
    }
  }, [
    editor,
    onNodeChange,
    getReferencedVirtualElement,
    pluginKey,
    computePositionConfig,
    onElementDragStart,
    onElementDragEnd,
    nestedOptions,
  ])

  const element = elementRef.current
  if (!element) {
    return null
  }

  return createPortal(children, element)
}
