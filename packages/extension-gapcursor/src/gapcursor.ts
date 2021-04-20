import {
  Extension,
  callOrReturn,
  getExtensionField,
  ParentConfig,
} from '@tiptap/core'
import { gapCursor } from 'prosemirror-gapcursor'

declare module '@tiptap/core' {
  interface NodeConfig<Options> {
    /**
     * Allow gap cursor
     */
    allowGapCursor?:
      | boolean
      | null
      | ((this: {
        name: string,
        options: Options,
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
    }

    return {
      allowGapCursor: callOrReturn(getExtensionField(extension, 'allowGapCursor', context)) ?? null,
    }
  },
})
