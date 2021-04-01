import React, { useEffect, useRef } from 'react'
import { FloatingMenuPlugin, FloatingMenuPluginKey, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export type FloatingMenuProps = Omit<FloatingMenuPluginProps, 'element'> & {
  className?: string,
}

export const FloatingMenu: React.FC<FloatingMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { editor } = props

    editor.registerPlugin(FloatingMenuPlugin({
      editor,
      element: element.current as HTMLElement,
    }))

    return () => {
      editor.unregisterPlugin(FloatingMenuPluginKey)
    }
  }, [])

  return (
    <div ref={element} className={props.className}>
      {props.children}
    </div>
  )
}
