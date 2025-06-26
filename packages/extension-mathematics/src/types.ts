import type { Editor } from '@tiptap/core'
import type { KatexOptions } from 'katex'

import type { BlockMathOptions, InlineMathOptions } from './extensions'

export type MathematicsOptions = {
  inlineOptions?: InlineMathOptions
  blockOptions?: BlockMathOptions
  katexOptions?: KatexOptions
}

export type MathematicsOptionsWithEditor = MathematicsOptions & { editor: Editor }
