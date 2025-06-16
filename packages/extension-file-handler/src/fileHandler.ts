import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'

import { FileHandlePlugin } from './FileHandlePlugin.js'
import { FileHandlerOptions } from './types.js'

export const FileHandler = Extension.create<FileHandlerOptions>({
  name: 'fileHandler',

  addOptions() {
    return {
      onPaste: undefined,
      onDrop: undefined,
      allowedMimeTypes: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      FileHandlePlugin({
        key: new PluginKey(this.name), editor: this.editor, allowedMimeTypes: this.options.allowedMimeTypes, onDrop: this.options.onDrop, onPaste: this.options.onPaste,
      }),
    ]
  },
})
