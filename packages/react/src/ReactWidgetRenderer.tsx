import { decoration, liveWidgetKeys } from '@tiptap/core'
import type { Editor, WidgetDecorationDescriptor } from '@tiptap/core'
import type { Mark } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
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

export interface ReactWidgetRendererOptions<P extends Record<string, any> = object> {
  /**
   * The editor instance.
   */
  editor: Editor
  /**
   * The document position the widget is rendered at.
   */
  pos: number
  /**
   * A stable, position-independent identifier for the widget. Reusing the same
   * key across renders lets ProseMirror keep the component mounted (no flicker /
   * no lost state) and lets this renderer reuse the underlying `ReactRenderer`.
   *
   * Good: `comment-${id}`, `paragraph-${node.attrs.id}`, `suggestion-${id}`
   * Bad:  paragraph index, document position, loop counter
   */
  key: string
  /**
   * Props passed to the component (merged with {@link ReactWidgetDecorationProps}).
   */
  props?: P
  /**
   * The tag name of the wrapper element. Defaults to `'span'` (widgets are
   * usually inline).
   */
  as?: string
  className?: string
  /**
   * The decoration's side bias (see ProseMirror's `Decoration.widget`).
   */
  side?: number
  marks?: readonly Mark[]
}

const WIDGET_CACHE = Symbol('tiptapReactWidgetCache')

/**
 * The live renderer for each widget key, kept on the editor and reused across
 * recomputes so the React component (and its state) is preserved instead of
 * remounted.
 */
type WidgetCache = Map<string, ReactRenderer>

function getCache(editor: Editor): WidgetCache {
  const host = editor as Editor & { [WIDGET_CACHE]?: WidgetCache }

  if (!host[WIDGET_CACHE]) {
    const cache: WidgetCache = new Map()

    host[WIDGET_CACHE] = cache

    // Sweep any widgets still mounted when the editor goes away.
    editor.on('destroy', () => {
      cache.forEach(renderer => renderer.destroy())
      cache.clear()
    })
  }

  return host[WIDGET_CACHE]
}

/**
 * Renders a React component into a ProseMirror widget decoration, reusing
 * Tiptap's existing `ReactRenderer` portal infrastructure so the component lives
 * in the editor's React tree (context and hooks work as usual).
 *
 * Returns a {@link WidgetDecorationDescriptor} ready to return from an
 * extension's `addDecorations().create()`, alongside `decoration.node` /
 * `decoration.inline`.
 *
 * @example
 * addDecorations() {
 *   return {
 *     create: ({ editor, state }) =>
 *       findMatches(state.doc).map(match =>
 *         ReactWidgetRenderer(MyWidget, {
 *           editor,
 *           pos: match.pos,
 *           key: `match-${match.id}`,
 *           props: { label: match.label },
 *         }),
 *       ),
 *   }
 * }
 */
export function ReactWidgetRenderer<P extends Record<string, any> = object>(
  component: ComponentType<P & ReactWidgetDecorationProps>,
  options: ReactWidgetRendererOptions<P>,
): WidgetDecorationDescriptor {
  const { editor, pos, key, props = {} as P, as = 'span', className, side, marks } = options
  const cache = getCache(editor)

  // `create()` re-runs on every recompute, so this is the reliable place to
  // push fresh props: ProseMirror skips the widget's `toDOM` when it reuses the
  // DOM, so prop updates can't ride along there.
  const existing = cache.get(key)

  if (existing) {
    existing.updateProps(props)
  }

  const render = (_view: EditorView, getPos: () => number | undefined): HTMLElement => {
    let renderer = cache.get(key)

    if (renderer) {
      renderer.updateProps({ ...props, editor, getPos })
    } else {
      renderer = new ReactRenderer(component, {
        editor,
        as,
        className,
        props: { ...props, editor, getPos },
      })
      cache.set(key, renderer)
    }

    // Re-register the portal on every materialization. ProseMirror calls this
    // when it (re)creates the widget's DOM, which is also when the editor's
    // content component is reliably available — covering the case where the
    // initial render happened before it was ready.
    renderer.render()

    return renderer.element
  }

  return decoration.widget(pos, render, {
    key,
    side,
    marks,
    destroy: () => {
      // Keep the renderer if the key is still a live widget decoration (it's
      // being reassigned/recreated, not removed). `liveWidgetKeys` reflects the
      // current state, so this is correct even when nothing recomputed (e.g.
      // `clearDecorations()`).
      if (liveWidgetKeys(editor).has(key)) {
        return
      }

      cache.get(key)?.destroy()
      cache.delete(key)
    },
  })
}
