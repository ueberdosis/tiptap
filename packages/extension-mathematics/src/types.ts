import type { Editor } from '@dibdab/core'
import type { KatexOptions } from 'katex'

import type { BlockMathOptions, InlineMathOptions } from './extensions/index.js'

/**
 * Configuration options for the Mathematics extension.
 * This type defines the available customization options for both inline and block math rendering.
 */
export type MathematicsOptions = {
  /** Configuration options specific to inline math nodes */
  inlineOptions?: Omit<InlineMathOptions, 'katexOptions'>
  /** Configuration options specific to block math nodes */
  blockOptions?: Omit<BlockMathOptions, 'katexOptions'>
  /** KaTeX-specific rendering options passed to the KaTeX library */
  katexOptions?: KatexOptions
}

/**
 * Extended mathematics options that include an editor instance.
 * This type combines the base mathematics options with an editor reference,
 * typically used internally by the extension for operations that require editor access.
 */
export type MathematicsOptionsWithEditor = MathematicsOptions & { editor: Editor }
