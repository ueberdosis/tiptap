import type { NodeViewProps as CoreNodeViewProps } from '@tiptap/core'
import type React from 'react'

export type ReactNodeViewProps<T = HTMLElement> = CoreNodeViewProps & {
  ref: React.RefObject<T | null>
  /** Whether a text selection is fully inside the node view. Always provided by ReactNodeViewRenderer. */
  selectionInside?: boolean
}
