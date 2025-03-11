import { type BubbleMenuPluginProps, BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { useCurrentEditor } from '@tiptap/solid'
import { createEffect, on, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'
import { Portal } from 'solid-js/web'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type BubbleMenuProps = Optional<Omit<Optional<BubbleMenuPluginProps, 'pluginKey'>, 'element'>, 'editor'> &
  JSX.HTMLAttributes<HTMLDivElement>

export const BubbleMenu = (props: BubbleMenuProps) => {
  const menuEl = document.createElement('div')

  const currentEditor = useCurrentEditor()

  const [, restProps] = splitProps(props, [
    'pluginKey',
    'editor',
    'updateDelay',
    'resizeDelay',
    'shouldShow',
    'options',
    'children',
  ])

  createEffect(
    on([() => props.editor, currentEditor], () => {
      const bubbleMenuElement = menuEl

      bubbleMenuElement.style.visibility = 'hidden'
      bubbleMenuElement.style.position = 'absolute'

      if (props.editor?.isDestroyed || currentEditor()?.isDestroyed) {
        return
      }

      const attachToEditor = props.editor || currentEditor()

      if (!attachToEditor) {
        console.warn('BubbleMenu component is not rendered inside of an editor component or does not have editor prop.')
        return
      }

      const pluginKey = props.pluginKey ?? 'bubbleMenu'

      const plugin = BubbleMenuPlugin({
        updateDelay: props.updateDelay,
        resizeDelay: props.resizeDelay,
        editor: attachToEditor,
        element: bubbleMenuElement,
        pluginKey,
        shouldShow: props.shouldShow ?? null,
        options: props.options,
      })

      attachToEditor.registerPlugin(plugin)

      onCleanup(() => {
        attachToEditor.unregisterPlugin(pluginKey)
        window.requestAnimationFrame(() => {
          if (bubbleMenuElement.parentNode) {
            bubbleMenuElement.parentNode.removeChild(bubbleMenuElement)
          }
        })
      })
    }),
  )

  return (
    <Portal ref={props.ref} mount={menuEl}>
      <div {...restProps}>{props.children}</div>
    </Portal>
  )
}
