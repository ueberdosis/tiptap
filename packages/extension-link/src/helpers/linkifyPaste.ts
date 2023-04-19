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
      handlePaste(_view, _event, slice) {
        const { state } = editor
        const { tr, selection } = state

        let currentPos = selection.anchor - 1

        // this only needs to run the linkify if the slice contains one text node
        // that is not already a link & the text is a valid URL
        slice.content.forEach(node => {
          const links = find(node.textContent)

          tr.insert(currentPos, node)

          links.forEach(link => {
            const linkStart = currentPos + link.start + 1
            const linkEnd = currentPos + link.end + 1

            const hasMark = tr.doc.rangeHasMark(linkStart, linkEnd, type)

            if (!hasMark) {
              tr.addMark(currentPos + link.start + 1, currentPos + link.end + 1, type.create({ href: link.href }))
            }
          })

          currentPos += node.nodeSize
        })

        editor.view.dispatch(tr)

        return true
      },
    },
  })
}
