import {
  type DragHandlePluginProps,
  type NestedOptions,
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
  normalizeNestedOptions,
} from '@tiptap/extension-drag-handle'
import type { Node } from '@tiptap/pm/model'
import type { Plugin } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/react'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

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
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const plugin = useRef<Plugin | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nestedOptions = useMemo(() => normalizeNestedOptions(nested), [JSON.stringify(nested)])

  useEffect(() => {
    let initPlugin: {
      plugin: Plugin
      unbind: () => void
    } | null = null

    if (!element) {
      return () => {
        plugin.current = null
      }
    }

    if (editor.isDestroyed) {
      return () => {
        plugin.current = null
      }
    }

    if (!plugin.current) {
      initPlugin = DragHandlePlugin({
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
      plugin.current = initPlugin.plugin

      editor.registerPlugin(plugin.current)
    }

    return () => {
      editor.unregisterPlugin(pluginKey)
      plugin.current = null
      if (initPlugin) {
        initPlugin.unbind()
        initPlugin = null
      }
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

  return (
    <div
      className={className}
      style={{ visibility: 'hidden', position: 'absolute' }}
      data-dragging="false"
      ref={setElement}
    >
      {children}
    </div>
  )
}
