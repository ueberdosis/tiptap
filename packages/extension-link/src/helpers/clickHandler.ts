import type { Editor } from '@tiptap/core'
import { getAttributes } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

type ClickHandlerOptions = {
  type: MarkType
  editor: Editor
  enableClickSelection?: boolean
  openOnClick?: boolean | 'whenNotEditable'
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
          let a = event.target as HTMLElement
          const els = []

          while (a.nodeName !== 'DIV') {
            els.push(a)
            a = a.parentNode as HTMLElement
          }
          link = els.find(value => value.nodeName === 'A') as HTMLAnchorElement
        }

        if (!link) {
          return false
        }

        const attrs = getAttributes(view.state, options.type.name)
        const href = link?.href ?? attrs.href
        const target = link?.target ?? attrs.target

        if (options.enableClickSelection) {
          options.editor.commands.extendMarkRange(options.type.name)
        }

        if (link && href) {
          // Always prevent default behavior for links
          event.preventDefault()

          // Determine if we should open the link based on openOnClick option
          let shouldOpen = false

          if (options.openOnClick === true) {
            shouldOpen = true
          } else if (options.openOnClick === 'whenNotEditable') {
            // Legacy option: open when editor is not editable
            shouldOpen = !view.editable
          } else {
            // openOnClick === false or undefined
            shouldOpen = false
          }

          if (shouldOpen) {
            window.open(href, target)
          }

          return true
        }

        return false
      },
    },
  })
}
