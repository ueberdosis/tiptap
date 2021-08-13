import React, { useEffect, useRef } from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export type BubbleMenuProps = Omit<BubbleMenuPluginProps, 'element'> & {
  className?: string,
}

export const BubbleMenu: React.FC<BubbleMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const {
      pluginKey,
      editor,
      tippyOptions,
      shouldShow,
    } = props

    editor.registerPlugin(BubbleMenuPlugin({
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
