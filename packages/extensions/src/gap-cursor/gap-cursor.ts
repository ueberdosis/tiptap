import type { ParentConfig } from '@dibdab/core'
import { callOrReturn, Extension, getExtensionField } from '@dibdab/core'
import { gapCursor } from '@dibdab/pm/gapcursor'

declare module '@dibdab/core' {
  interface NodeConfig<Options, Storage> {
    /**
     * A function to determine whether the gap cursor is allowed at the current position. Must return `true` or `false`.
     * @default null
     */
    allowGapCursor?:
      | boolean
      | null
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options>>['allowGapCursor']
        }) => boolean | null)
  }
}

/**
 * This extension allows you to add a gap cursor to your editor.
 * A gap cursor is a cursor that appears when you click on a place
 * where no content is present, for example inbetween nodes.
 * @see https://tiptap.dev/api/extensions/gapcursor
 */
export const Gapcursor = Extension.create({
  name: 'gapCursor',

  addProseMirrorPlugins() {
    return [gapCursor()]
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
