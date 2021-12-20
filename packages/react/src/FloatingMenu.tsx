import React, { useEffect, useState, useCallback, RefCallback } from 'react'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element'> & {
  className?: string,
}

export const FloatingMenu: React.FC<FloatingMenuProps> = props => {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const elementRef = useCallback<RefCallback<HTMLDivElement>>(node => setElement(node), [])

  useEffect(() => {
    if (!element) return

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
    <div ref={elementRef} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
