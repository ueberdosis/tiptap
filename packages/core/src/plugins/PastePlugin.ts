import { Plugin, PluginKey } from '@tiptap/pm/state'

export const PastePlugin = (onPaste: (e: ClipboardEvent) => void) => {
  return new Plugin({
    key: new PluginKey('tiptapPaste'),

    props: {
      handlePaste: (_, e) => {
        onPaste(e)
      },
    },
  })
}
