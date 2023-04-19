import { Editor } from '@tiptap/core'
import { MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { find } from 'linkifyjs'

export type LinkifyPastePluginOptions = {
  editor: Editor
  type: MarkType
}

export const LinkifyPastePlugin = ({ editor, type }: LinkifyPastePluginOptions) => {
  return new Plugin({
    key: new PluginKey('linkifyPaste'),

    props: {
      handlePaste(view, event, slice) {
        let linkHref: string | null = null
        let link = null

        // this only needs to run the linkify if the slice contains one text node
        // that is not already a link & the text is a valid URL
        slice.content.forEach(node => {
          link = find(node.textContent).find(item => item.isLink)

          if (link && node.marks.some(mark => mark.type === type)) {
            return
          }

          const text = node.textContent

          if (!text || !link) {
            return
          }

          linkHref = link.href
        })

        if (!linkHref || !link) {
          return false
        }

        // handle pasting of links
        editor.chain().insertContent(`<a href="${linkHref}">${slice.content.child(0).textContent}</a>`).focus().run()

        return true
      },
    },
  })
}
