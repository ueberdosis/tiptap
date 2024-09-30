import type { Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

export type PastOptions = {
  onPaste?: (e: ClipboardEvent, slice: Slice) => void;
}

export const Paste = Extension.create<PastOptions>({
  name: 'paste',

  addOptions() {
    return {
      onPaste: undefined,
    }
  },

  addProseMirrorPlugins() {
    const onPaste = this.options.onPaste

    if (!onPaste) {
      return []
    }

    return [
      new Plugin({
        key: new PluginKey('tiptapPaste'),

        props: {
          handlePaste: (_view, e, slice) => {
            onPaste(e, slice)
          },
        },
      }),
    ]
  },
})
