import {
  Extension,
  callOrReturn,
  createExtensionContext,
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
        options: Options,
        parentConfig: ParentConfig<NodeConfig<Options>>,
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
    const context = createExtensionContext(extension, {
      options: extension.options,
    })

    return {
      allowGapCursor: callOrReturn(extension.config.allowGapCursor, context) ?? null,
    }
  },
})
