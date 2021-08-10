import React, { useEffect, useRef } from 'react'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export type FloatingMenuProps = Omit<FloatingMenuPluginProps, 'element'> & {
  className?: string,
}

export const FloatingMenu: React.FC<FloatingMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const {
      key,
      editor,
      tippyOptions,
      shouldShow,
    } = props

    editor.registerPlugin(FloatingMenuPlugin({
      key,
      editor,
      element: element.current as HTMLElement,
      tippyOptions,
      shouldShow,
    }))

    return () => {
      editor.unregisterPlugin(key)
    }
  }, [])

  return (
    <div ref={element} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
