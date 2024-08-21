import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Slice } from 'packages/pm/model'

export const DropPlugin = (onDrop: (e: DragEvent, slice: Slice, moved: boolean) => void) => {
  return new Plugin({
    key: new PluginKey('tiptapDrop'),

    props: {
      handleDrop: (_, e, slice, moved) => {
        onDrop(e, slice, moved)
      },
    },
  })
}
