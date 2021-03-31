import React, { useEffect, useRef } from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginKey, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export type BubbleMenuProps = Omit<BubbleMenuPluginProps, 'element'>

export const BubbleMenu: React.FC<BubbleMenuProps> = (props) => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { editor, keepInBounds } = props

    editor.registerPlugin(BubbleMenuPlugin({
      editor,
      element: element.current as HTMLElement,
      keepInBounds,
    }))

    return () => {
      editor.unregisterPlugin(BubbleMenuPluginKey)
    }
  }, [])

  return (
    <div ref={element}>
      {props.children}
    </div>
  )
}
