import type { Editor } from '@tiptap/core'
import { getAttributes } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

type ClickHandlerOptions = {
  type: MarkType
  editor: Editor
  openOnClick?: boolean
  enableClickSelection?: boolean
}

export function clickHandler(options: ClickHandlerOptions): Plugin {
  return new Plugin({
    key: new PluginKey('handleClickLink'),
    props: {
      handleClick: (view, pos, event) => {
        if (event.button !== 0) {
          return false
        }

        if (!view.editable) {
          return false
        }

        let link: HTMLAnchorElement | null = null

        if (event.target instanceof HTMLAnchorElement) {
          link = event.target
        } else {
          link = (event.target as HTMLElement).closest('a')
        }

        if (!link) {
          return false
        }

        let handled = false

        if (options.enableClickSelection) {
          const commandResult = options.editor.commands.extendMarkRange(options.type.name)
          handled = commandResult
        }

        if (options.openOnClick) {
          const attrs = getAttributes(view.state, options.type.name)
          const href = link.href ?? attrs.href
          const target = link.target ?? attrs.target

          if (href) {
            window.open(href, target)
            handled = true
          }
        }

        return handled
      },
    },
  })
}
