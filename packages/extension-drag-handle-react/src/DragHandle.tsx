import type { DragHandlePluginProps } from '@tiptap/extension-drag-handle'
import {
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
} from '@tiptap/extension-drag-handle'
import type { Node } from '@tiptap/pm/model'
import type { Plugin } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/react'
import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<
  Optional<DragHandlePluginProps, 'pluginKey'>,
  'element'
> & {
  className?: string
  onNodeChange?: (data: {
    node: Node | null
    editor: Editor
    pos: number
  }) => void
  children: ReactNode

  /**
   * Tippy.js options for the drag handle tooltip.
   *
   * **IMPORTANT**: Make sure to memoize this object - otherwise the object
   * will cause the drag handle to be re-initialized on every render breaking it.
   */
  tippyOptions?: DragHandlePluginProps['tippyOptions']
}

export const DragHandle = (props: DragHandleProps) => {
  const {
    className = 'drag-handle',
    children,
    editor,
    pluginKey = dragHandlePluginDefaultKey,
    onNodeChange,
    tippyOptions,
  } = props
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const plugin = useRef<Plugin | null>(null)

  const onNodeChangeRef = useRef(onNodeChange)
  const tippyOptionsRef = useRef(tippyOptions)

  useEffect(() => {
    onNodeChangeRef.current = onNodeChange
  }, [onNodeChange])

  useEffect(() => {
    tippyOptionsRef.current = tippyOptions
  }, [tippyOptions])

  useEffect(() => {
    if (!element || editor.isDestroyed) {
      return
    }

    if (!plugin.current) {
      plugin.current = DragHandlePlugin({
        editor,
        element,
        pluginKey,
        tippyOptions: tippyOptionsRef.current,
        onNodeChange: onNodeChangeRef.current,
      })

      editor.registerPlugin(plugin.current)
    }

    return () => {
      if (plugin.current) {
        editor.unregisterPlugin(pluginKey)
        plugin.current = null
      }
    }
  }, [editor, element, pluginKey])

  return (
    <div className={className} ref={setElement}>
      {children}
    </div>
  )
}
