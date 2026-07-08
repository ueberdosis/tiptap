import type { ComponentType, ReactNode, Ref } from 'react'

import type { Decoration } from '@tiptap/pm/view'
import { Decoration as DecorationStatic } from '@tiptap/pm/view'

/** The props a React widget component receives. */
export interface WidgetComponentProps {
  /** The decoration being rendered. */
  widget: Decoration
  /** The widget's current document position. */
  getPos: () => number | undefined
  /** Must be attached to the component's top-level element. */
  ref: Ref<HTMLElement>
  children?: ReactNode
}

// oxlint-disable-next-line no-explicit-any
export type WidgetComponent = ComponentType<WidgetComponentProps & Record<string, any>>

/** The widget spec fields the renderer honors, plus arbitrary user fields. */
export interface ReactWidgetSpec {
  side?: number
  key?: string
  stopEvent?: (event: Event) => boolean
  ignoreSelection?: boolean
  destroy?: (node: Node) => void
  [key: string]: unknown
}

/** The spec field our `widget()` helper stores its component under. */
const WIDGET_COMPONENT_SPEC = '__tiptapReactComponent'

/**
 * A widget decoration rendered by a React component instead of a DOM node.
 *
 * Implemented on top of the public `Decoration.widget()` with an inert
 * `toDOM` fallback: the base view never renders (its document rendering is
 * neutralized), so only this renderer consumes the decoration, through the
 * component stored on the spec.
 */
export const widget = (
  pos: number,
  component: WidgetComponent,
  spec?: ReactWidgetSpec,
): Decoration =>
  DecorationStatic.widget(pos, () => document.createElement('span'), {
    ...spec,
    [WIDGET_COMPONENT_SPEC]: component,
  })

/** The React component of a widget created by `widget()`, if any. */
export const widgetComponent = (decoration: Decoration): WidgetComponent | undefined =>
  decoration.spec[WIDGET_COMPONENT_SPEC] as WidgetComponent | undefined
