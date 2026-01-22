import {
  type DragHandlePluginProps,
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
} from '@dibdab/extension-drag-handle'
import type { Node } from '@dibdab/pm/model'
import type { Plugin } from '@dibdab/pm/state'
import type { Editor } from '@dibdab/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey'>, 'element'> & {
  className?: string
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void
  children: ReactNode
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
  } = props
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const plugin = useRef<Plugin | null>(null)

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
  }, [element, editor, onNodeChange, pluginKey, computePositionConfig, onElementDragStart, onElementDragEnd])

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
