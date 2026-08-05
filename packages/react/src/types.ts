import type { NodeViewProps as CoreNodeViewProps } from '@tiptap/core'
import type React from 'react'

/**
 * What a React node view component receives.
 */
export type ReactNodeViewProps<T = HTMLElement> = CoreNodeViewProps & {
  ref: React.RefObject<T | null>
}
