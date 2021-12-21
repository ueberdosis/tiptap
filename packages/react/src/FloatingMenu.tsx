import React, {
  useEffect, useState,
} from 'react'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element'> & {
  className?: string,
}

export const FloatingMenu: React.FC<FloatingMenuProps> = props => {
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!element) {
      return
    }

    if (props.editor.isDestroyed) {
      return
    }

    const {
      pluginKey = 'floatingMenu',
      editor,
      tippyOptions = {},
      shouldShow = null,
    } = props

    const plugin = FloatingMenuPlugin({
      pluginKey,
      editor,
      element,
      tippyOptions,
      shouldShow,
    })

    editor.registerPlugin(plugin)
    return () => editor.unregisterPlugin(pluginKey)
  }, [
    props.editor,
    element,
  ])

  return (
    <div ref={setElement} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
