import { Extension } from '@dibdab/core'
import { PluginKey } from '@dibdab/pm/state'

import { FileHandlePlugin } from './FileHandlePlugin.js'
import type { FileHandlerOptions } from './types.js'

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
        key: new PluginKey(this.name),
        editor: this.editor,
        allowedMimeTypes: this.options.allowedMimeTypes,
        onDrop: this.options.onDrop,
        onPaste: this.options.onPaste,
      }),
    ]
  },
})
