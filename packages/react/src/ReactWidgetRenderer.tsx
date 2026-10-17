import { createWidgetDecoration } from '@tiptap/core'
import type { Editor, WidgetDecoration, WidgetDecorationOptions } from '@tiptap/core'
import type { ComponentType } from 'react'

import { ReactRenderer } from './ReactRenderer.js'

/**
 * Props every widget-decoration component receives in addition to the props you
 * pass through `ReactWidgetRenderer`.
 */
export interface ReactWidgetDecorationProps {
  editor: Editor
  getPos: () => number | undefined
}

export interface ReactWidgetRendererOptions<
  P extends Record<string, any> = object,
> extends WidgetDecorationOptions {
  /**
   * The editor instance.
   */
  editor: Editor
  /**
   * The document position the widget is rendered at.
   */
  pos: number
  /**
   * A stable, position-independent identifier for the widget.
   * Reusing the same key keeps the component mounted across re-renders.
   * Good: `comment-${id}`. Bad: paragraph index or document position.
   */
  key: string
  /**
   * Props passed to the component (merged with {@link ReactWidgetDecorationProps}).
   */
  props?: P
  /**
   * The tag name of the wrapper element. Defaults to `'span'` (widgets are
   * usually inline). Applied only when the renderer is first created; later
   * renders with the same `key` keep the original tag.
   */
  as?: string
  /**
   * Applied only when the renderer is first created; later renders with the
   * same `key` keep the original class.
   */
  className?: string
}

const WIDGET_CACHE = Symbol('tiptapReactWidgetCache')

/**
 * Renders a React component into a ProseMirror widget decoration.
 * Reuses Tiptap's `ReactRenderer` so the component lives in the editor's
 * React tree (context and hooks work as usual). Use a stable `key` for
 * stateful widgets.
 * @example
 * addDecorations() {
 *   return {
 *     create: ({ editor, state }) =>
 *       findMatches(state.doc).map(match =>
 *         ReactWidgetRenderer(MyWidget, {
 *           editor, pos: match.pos, key: `match-${match.id}`,
 *           props: { label: match.label },
 *         }),
 *       ),
 *   }
 * }
 */
export function ReactWidgetRenderer<P extends Record<string, any> = object>(
  component: ComponentType<P & ReactWidgetDecorationProps>,
  options: ReactWidgetRendererOptions<P>,
): WidgetDecoration {
  const { editor, props = {} as P, as = 'span', className } = options

  return createWidgetDecoration<ReactRenderer>({
    // Forwards editor, pos, key and the ProseMirror widget options unchanged.
    ...options,
    props,
    cacheKey: WIDGET_CACHE,
    context: getPos => ({ editor, getPos }),
    create: renderProps =>
      new ReactRenderer(component, {
        editor,
        as,
        className,
        props: renderProps,
      }),
    materialize: renderer => {
      // Re-register the portal on every materialization so the editor's
      // content component is available even on late first renders.
      renderer.render()

      return renderer.element
    },
  })
}
