import type { NodeViewProps as CoreNodeViewProps } from '@tiptap/core'
import type React from 'react'

export type ReactNodeViewProps<T = HTMLElement> = CoreNodeViewProps & {
  ref: React.RefObject<T>
  node: any // TODO: Replace with a more specific type if possible
}
