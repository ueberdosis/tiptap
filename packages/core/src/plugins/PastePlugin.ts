import { Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const PastePlugin = (onPaste: (e: ClipboardEvent, slice: Slice) => void) => {
  return new Plugin({
    key: new PluginKey('tiptapPaste'),

    props: {
      handlePaste: (_view, e, slice) => {
        onPaste(e, slice)
      },
    },
  })
}
