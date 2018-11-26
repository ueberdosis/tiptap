import { Mark, Plugin, TextSelection } from 'tiptap'
import { updateMark, removeMark, wrappingPasteRule } from 'tiptap-commands'
import { getMarkRange } from 'tiptap-utils'

export default class Link extends Mark {

  get name() {
    return 'link'
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: dom => ({
            href: dom.getAttribute('href'),
          }),
        },
      ],
      toDOM: node => ['a', {
        ...node.attrs,
        rel: 'noopener noreferrer nofollow',
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
      wrappingPasteRule(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
        type,
        url => ({ href: url }),
      ),
    ]
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick(view, pos) {
            const { schema, doc, tr } = view.state
            const range = getMarkRange(doc.resolve(pos), schema.marks.link)

            if (!range) {
              return
            }

            const $start = doc.resolve(range.from)
            const $end = doc.resolve(range.to)
            const transaction = tr.setSelection(new TextSelection($start, $end))

            view.dispatch(transaction)
          },
        },
      }),
    ]
  }

}
