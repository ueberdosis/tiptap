import {
  Extension,
  callOrReturn,
  getExtensionField,
  ParentConfig,
} from '@tiptap/core'
import { gapCursor } from 'prosemirror-gapcursor'

declare module '@tiptap/core' {
  interface NodeConfig<Options, Storage> {
    /**
     * Allow gap cursor
     */
    allowGapCursor?:
      | boolean
      | null
      | ((this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options>>['allowGapCursor'],
      }) => boolean | null),
  }
}

export const Gapcursor = Extension.create({
  name: 'gapCursor',

  addProseMirrorPlugins() {
    return [
      gapCursor(),
    ]
  },

  extendNodeSchema(extension) {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
    }

    return {
      allowGapCursor: callOrReturn(getExtensionField(extension, 'allowGapCursor', context)) ?? null,
    }
  },
})
