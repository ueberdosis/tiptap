import React, { useEffect, useRef } from 'react'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element'> & {
  className?: string,
}

export const FloatingMenu: React.FC<FloatingMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const {
      pluginKey = 'floatingMenu',
      editor,
      tippyOptions = {},
      shouldShow = null,
    } = props

    editor.registerPlugin(FloatingMenuPlugin({
      pluginKey,
      editor,
      element: element.current as HTMLElement,
      tippyOptions,
      shouldShow,
    }))

    return () => {
      editor.unregisterPlugin(pluginKey)
    }
  }, [])

  return (
    <div ref={element} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
