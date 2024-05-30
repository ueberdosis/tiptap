import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DropPlugin = (onPaste: (e: DragEvent) => void) => {
  return new Plugin({
    key: new PluginKey('tiptap__drop'),

    props: {
      handleDrop: (_, e) => {
        onPaste(e)
      },
    },
  })
}
