import { Mark, Plugin } from 'tiptap'
import { updateMark, removeMark, pasteRule } from 'tiptap-commands'
import { getMarkAttrs } from 'tiptap-utils'

export default class Link extends Mark {

  get name() {
    return 'link'
  }

  get defaultOptions() {
    return {
      openOnClick: true,
      target: null,
    }
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: null,
        },
        target: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: dom => ({
            href: dom.getAttribute('href'),
            target: dom.getAttribute('target'),
          }),
        },
      ],
      toDOM: node => ['a', {
        ...node.attrs,
        rel: 'noopener noreferrer nofollow',
        target: node.attrs.target || this.options.target,
      }, 0],
    }
  }

  commands({ type }) {
    return attrs => {
      if (attrs.href) {
        return updateMark(type, attrs)
      }

      return removeMark(type)
    }
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()]*)/gi,
        type,
        url => ({ href: url }),
      ),
    ]
  }

  get plugins() {
    if (!this.options.openOnClick) {
      return []
    }

    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            const { schema } = view.state
            const attrs = getMarkAttrs(view.state, schema.marks.link)

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation()
              window.open(attrs.href, attrs.target)
            }
          },
        },
      }),
    ]
  }

}
