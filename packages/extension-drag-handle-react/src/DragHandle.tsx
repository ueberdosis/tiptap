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
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey'>, 'element' | 'nestedOptions'> & {
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
    computePositionConfig = defaultComputePositionConfig,
    nested = false,
  } = props
  const [element] = useState<HTMLDivElement | null>(() => {
    if (typeof document === 'undefined') {
      return null
    }

    return document.createElement('div')
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nestedOptions = useMemo(() => normalizeNestedOptions(nested), [JSON.stringify(nested)])

  useEffect(() => {
    if (!element) {
      return
    }

    element.className = className
    element.style.visibility = 'hidden'
    element.style.position = 'absolute'
    element.dataset.dragging = 'false'
  }, [className, element])

  useEffect(() => {
    if (!element) {
      return
    }

    if (editor.isDestroyed) {
      return
    }

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
    element,
    editor,
    onNodeChange,
    pluginKey,
    computePositionConfig,
    onElementDragStart,
    onElementDragEnd,
    nestedOptions,
  ])

  if (!element) {
    return null
  }

  return createPortal(children, element)
}
