import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { useCurrentEditor } from '@tiptap/solid'
import { createEffect, on, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'
import { Portal } from 'solid-js/web'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element' | 'editor'> & {
  editor: FloatingMenuPluginProps['editor'] | null
  options?: FloatingMenuPluginProps['options']
} & JSX.HTMLAttributes<HTMLDivElement>

export const FloatingMenu = (props: FloatingMenuProps) => {
  const menuEl = document.createElement('div')

  const currentEditor = useCurrentEditor()

  const [, restProps] = splitProps(props, ['pluginKey', 'editor', 'shouldShow', 'options', 'children'])

  createEffect(
    on([() => props.editor, currentEditor], () => {
      const floatingMenuElement = menuEl

      floatingMenuElement.style.visibility = 'hidden'
      floatingMenuElement.style.position = 'absolute'

      if (props.editor?.isDestroyed || currentEditor()?.isDestroyed) {
        return
      }

      const attachToEditor = props.editor || currentEditor()

      if (!attachToEditor) {
        console.warn(
          'FloatingMenu component is not rendered inside of an editor component or does not have editor prop.',
        )
        return
      }

      const pluginKey = props.pluginKey ?? 'floatingMenu'

      const plugin = FloatingMenuPlugin({
        editor: attachToEditor,
        element: floatingMenuElement,
        pluginKey,
        shouldShow: props.shouldShow ?? null,
        options: props.options,
      })

      attachToEditor.registerPlugin(plugin)

      onCleanup(() => {
        attachToEditor.unregisterPlugin(pluginKey)
        window.requestAnimationFrame(() => {
          if (floatingMenuElement.parentNode) {
            floatingMenuElement.parentNode.removeChild(floatingMenuElement)
          }
        })
      })
    }),
  )

  return (
    <Portal ref={props.ref} mount={menuEl}>
      <div {...restProps}>{props.children}</div>,
    </Portal>
  )
}
