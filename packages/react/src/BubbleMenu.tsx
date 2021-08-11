import React, { useEffect, useRef } from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export type BubbleMenuProps = Omit<BubbleMenuPluginProps, 'element'> & {
  className?: string,
}

export const BubbleMenu: React.FC<BubbleMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const {
      key,
      editor,
      tippyOptions,
      shouldShow,
    } = props

    editor.registerPlugin(BubbleMenuPlugin({
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
