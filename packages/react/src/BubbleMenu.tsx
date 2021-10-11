import React, { useEffect, useRef } from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type BubbleMenuProps = Omit<Optional<BubbleMenuPluginProps, 'pluginKey'>, 'element'> & {
  className?: string,
}

export const BubbleMenu: React.FC<BubbleMenuProps> = props => {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!element.current) return

    const {
      pluginKey = 'bubbleMenu',
      editor,
      tippyOptions = {},
      shouldShow = null,
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
  }, [
    props.editor,
    element.current,
  ])

  return (
    <div ref={element} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
