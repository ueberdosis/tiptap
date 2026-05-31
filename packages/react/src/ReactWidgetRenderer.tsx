import { decoration } from '@tiptap/core'
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

interface WidgetCache {
  /**
   * The live renderer for each widget key. Reused across recomputes so the
   * React component (and its state) is preserved instead of remounted.
   */
  renderers: Map<string, ReactRenderer>
  /**
   * The keys produced by the current `create()` pass. ProseMirror may, while a
   * key is being reassigned to a different position, destroy the old decoration
   * for that key in the same update that re-produces it. We must not tear down a
   * renderer whose key is still live, or the surviving widget is left empty.
   */
  liveKeys: Set<string>
  passActive: boolean
}

function getCache(editor: Editor): WidgetCache {
  const host = editor as Editor & { [WIDGET_CACHE]?: WidgetCache }

  if (!host[WIDGET_CACHE]) {
    const cache: WidgetCache = {
      renderers: new Map(),
      liveKeys: new Set(),
      passActive: false,
    }

    host[WIDGET_CACHE] = cache

    // Sweep any widgets still mounted when the editor goes away.
    editor.on('destroy', () => {
      cache.renderers.forEach(renderer => renderer.destroy())
      cache.renderers.clear()
    })
  }

  return host[WIDGET_CACHE]
}

/**
 * Records `key` as live for the current `create()` pass. The first call of a
 * pass resets the set; it is reset again after the surrounding transaction
 * (and its synchronous redraw) has flushed.
 */
function markLive(cache: WidgetCache, key: string): void {
  if (!cache.passActive) {
    cache.passActive = true
    cache.liveKeys.clear()
    queueMicrotask(() => {
      cache.passActive = false
    })
  }

  cache.liveKeys.add(key)
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

  markLive(cache, key)

  // `create()` re-runs on every recompute, so this is the reliable place to
  // push fresh props: ProseMirror skips the widget's `toDOM` when it reuses the
  // DOM, so prop updates can't ride along there.
  const existing = cache.renderers.get(key)

  if (existing) {
    existing.updateProps(props)
  }

  const render = (_view: EditorView, getPos: () => number | undefined): HTMLElement => {
    let renderer = cache.renderers.get(key)

    if (renderer) {
      renderer.updateProps({ editor, getPos })
    } else {
      renderer = new ReactRenderer(component, {
        editor,
        as,
        className,
        props: { ...props, editor, getPos },
      })
      cache.renderers.set(key, renderer)
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
      // Skip teardown when the key is still produced by the latest pass — the
      // decoration is being reassigned/recreated, not removed.
      if (cache.liveKeys.has(key)) {
        return
      }

      cache.renderers.get(key)?.destroy()
      cache.renderers.delete(key)
    },
  })
}
