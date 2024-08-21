import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DropPlugin = (onDrop: (e: DragEvent) => void) => {
  return new Plugin({
    key: new PluginKey('tiptapDrop'),

    props: {
      handleDrop: (_, e) => {
        onDrop(e)
      },
    },
  })
}
