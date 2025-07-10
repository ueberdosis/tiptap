import { getAttributes, getMarkRange } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

type ClickHandlerOptions = {
  type: MarkType
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
          const { doc, tr } = view.state
          const range = getMarkRange(doc.resolve(pos), options.type)
          if (range) {
            const { from, to } = range
            const $from = doc.resolve(from)
            const $to = doc.resolve(to)
            const transaction = tr.setSelection(new TextSelection($from, $to))
            view.dispatch(transaction)
          }
        }

        if (link && href) {
          window.open(href, target)

          return true
        }

        return false
      },
    },
  })
}
