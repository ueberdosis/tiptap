import { Extension, ParentConfig } from '@tiptap/core'

import { InvisiblesPlugin } from './plugin'
import { InvisiblesOptions } from './types'

declare module '@tiptap/core' {
  interface NodeConfig<Options, Storage> {
    /**
     * Show invisibles
     */
    showInvisibles?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options>>['allowGapCursor'],
    }) => null

    /**
     * hide invisibles
     */
     hideInvisibles?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options>>['allowGapCursor'],
    }) => null
  }
}

export const Invisibles = Extension.create<InvisiblesOptions>({
  name: 'invisibles',

  addOptions() {
    return {
      spaces: true,
      hardBreaks: true,
      paragraph: true,
    }
  },

  addProseMirrorPlugins() {
    return [
      InvisiblesPlugin(this.editor.state, this.options),
    ]
  },
})
