import type { Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

export type DropOptions = {
  onDrop?: (e: DragEvent, slice: Slice, moved: boolean) => void;
}

export const Drop = Extension.create<DropOptions>({
  name: 'drop',

  addOptions() {
    return {
      onDrop: undefined,
    }
  },

  addProseMirrorPlugins() {
    const onDrop = this.options.onDrop

    if (!onDrop) {
      return []
    }

    return [
      new Plugin({
        key: new PluginKey('tiptapDrop'),

        props: {
          handleDrop: (_, e, slice, moved) => {
            onDrop(e, slice, moved)
          },
        },
      }),
    ]
  },
})
