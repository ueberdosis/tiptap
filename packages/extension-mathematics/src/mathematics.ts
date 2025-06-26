import { Extension } from '@tiptap/core'

import { BlockMath, InlineMath } from './extensions/index.js'
import type { MathematicsOptions } from './types.js'

export const Math = Extension.create<MathematicsOptions>({
  name: 'Mathematics',

  addOptions() {
    return {
      inlineOptions: undefined,
      blockOptions: undefined,
      katexOptions: undefined,
    }
  },

  addExtensions() {
    return [BlockMath.configure(this.options.blockOptions), InlineMath.configure(this.options.inlineOptions)]
  },
})

export const Mathematics = Math

export default Math
