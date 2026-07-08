import type { Editor } from '@tiptap/core'
import type { Mark } from '@tiptap/pm/model'
import type { ComponentType, ReactNode, Ref } from 'react'

/**
 * The props a React mark view component receives. Aligned with Tiptap's
 * legacy `MarkViewRendererProps`, minus the wrapper: the component renders
 * its own top-level element and must attach `ref` to it, and renders
 * `children` inside the element it attaches `contentDOMRef` to (use
 * `useMergedRefs` when both target the same element).
 */
export interface MarkViewComponentProps<Element extends HTMLElement = HTMLElement> {
  editor: Editor
  mark: Mark
  /** HTML attributes computed from the extension's attribute config. */
  HTMLAttributes: Record<string, unknown>
  /** Updates the mark's attributes wherever this mark instance applies. */
  updateAttributes: (attributes: Record<string, unknown>) => void
  /** Must be attached to the component's top-level element. */
  ref: Ref<Element>
  /** Must be attached to the element holding `children`. */
  contentDOMRef: Ref<HTMLElement>
  /** The inline content the mark spans. */
  children?: ReactNode
}

// oxlint-disable-next-line no-explicit-any
export type MarkViewComponent = ComponentType<MarkViewComponentProps<any>>
