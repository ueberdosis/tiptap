import React, { useEffect, useRef } from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginKey, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export type BubbleMenuProps = Omit<BubbleMenuPluginProps, 'element'> & {
  className?: string,
}

export const BubbleMenu: React.FC<BubbleMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { editor, tippyOptions } = props

    editor.registerPlugin(BubbleMenuPlugin({
      editor,
      element: element.current as HTMLElement,
      tippyOptions,
    }))

    return () => {
      editor.unregisterPlugin(BubbleMenuPluginKey)
    }
  }, [])

  return (
    <div ref={element} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
