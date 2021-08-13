import React, { useEffect, useRef } from 'react'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export type FloatingMenuProps = Omit<FloatingMenuPluginProps, 'element'> & {
  className?: string,
}

export const FloatingMenu: React.FC<FloatingMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const {
      pluginKey,
      editor,
      tippyOptions,
      shouldShow,
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
