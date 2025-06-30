import {
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
  DragHandlePluginProps,
} from '@tiptap/extension-drag-handle'
import { Node } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'
import { Editor } from '@tiptap/react'
import React, {
  ReactNode, useEffect, useRef, useState,
} from 'react'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey'>, 'element'> & {
  className?: string;
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void;
  children: ReactNode;

  /**
   * Tippy.js options for the drag handle tooltip.
   *
   * **IMPORTANT**: Make sure to memorize this object - otherwise the object
   * will cause the drag handle to be re-initialized on every render breaking it.
   */
  tippyOptions?: DragHandlePluginProps['tippyOptions'];
};

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

  useEffect(() => {
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
      plugin.current = DragHandlePlugin({
        editor,
        element,
        pluginKey,
        tippyOptions,
        onNodeChange,
      })

      editor.registerPlugin(plugin.current)
    }

    return () => {
      editor.unregisterPlugin(pluginKey)
      plugin.current = null
    }
  }, [element, editor, onNodeChange, pluginKey, tippyOptions])

  return (
    <div className={className} ref={setElement}>
      {children}
    </div>
  )
}
