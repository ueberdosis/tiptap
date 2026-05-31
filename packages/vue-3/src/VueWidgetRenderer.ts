import { decoration } from '@tiptap/core'
import type { Editor, WidgetDecorationDescriptor } from '@tiptap/core'
import type { Mark } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import type { Component } from 'vue'
import { markRaw } from 'vue'

import { VueRenderer } from './VueRenderer.js'

/**
 * Props every widget-decoration component receives in addition to the props you
 * pass through `VueWidgetRenderer`.
 */
export interface VueWidgetDecorationProps {
  editor: Editor
  getPos: () => number | undefined
}

export interface VueWidgetRendererOptions {
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
   * no lost state) and lets this renderer reuse the underlying `VueRenderer`.
   */
  key: string
  /**
   * Props passed to the component (merged with {@link VueWidgetDecorationProps}).
   * The component must have a single root element.
   */
  props?: Record<string, any>
  /**
   * The decoration's side bias (see ProseMirror's `Decoration.widget`).
   */
  side?: number
  marks?: readonly Mark[]
}

const WIDGET_CACHE = Symbol('tiptapVueWidgetCache')

interface WidgetCache {
  /**
   * The live renderer for each widget key. Reused across recomputes so the
   * Vue component (and its state) is preserved instead of remounted.
   */
  renderers: Map<string, VueRenderer>
  /**
   * The last props pushed to each widget. Used to skip re-renders when nothing
   * changed: `VueRenderer.updateProps` always re-renders, so without this guard
   * every widget would re-render synchronously on every transaction.
   */
  props: Map<string, Record<string, any>>
  /**
   * The keys produced by the current `create()` pass. ProseMirror may, while a
   * key is being reassigned to a different position, destroy the old decoration
   * for that key in the same update that re-produces it. We must not tear down a
   * renderer whose key is still live, or the surviving widget is left empty.
   */
  liveKeys: Set<string>
  passActive: boolean
}

function shallowEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) {
    return false
  }

  return aKeys.every(key => a[key] === b[key])
}

function getCache(editor: Editor): WidgetCache {
  const host = editor as Editor & { [WIDGET_CACHE]?: WidgetCache }

  if (!host[WIDGET_CACHE]) {
    const cache: WidgetCache = {
      renderers: new Map(),
      props: new Map(),
      liveKeys: new Set(),
      passActive: false,
    }

    host[WIDGET_CACHE] = cache

    // Sweep any widgets still mounted when the editor goes away.
    editor.on('destroy', () => {
      cache.renderers.forEach(renderer => renderer.destroy())
      cache.renderers.clear()
      cache.props.clear()
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
 * Renders a Vue component into a ProseMirror widget decoration, reusing Tiptap's
 * existing `VueRenderer` so the component shares the editor's app context
 * (provide/inject works as usual).
 *
 * Returns a {@link WidgetDecorationDescriptor} ready to return from an
 * extension's `addDecorations().create()`, alongside `decoration.node` /
 * `decoration.inline`. The component must render a single root element.
 *
 * @example
 * addDecorations() {
 *   return {
 *     create: ({ editor, state }) =>
 *       findMatches(state.doc).map(match =>
 *         VueWidgetRenderer(MyWidget, {
 *           editor,
 *           pos: match.pos,
 *           key: `match-${match.id}`,
 *           props: { label: match.label },
 *         }),
 *       ),
 *   }
 * }
 */
export function VueWidgetRenderer(
  component: Component,
  options: VueWidgetRendererOptions,
): WidgetDecorationDescriptor {
  const { editor, pos, key, props = {}, side, marks } = options
  const cache = getCache(editor)

  markLive(cache, key)

  // `create()` re-runs on every recompute, so this is the reliable place to
  // push fresh props: ProseMirror skips the widget's `toDOM` when it reuses the
  // DOM, so prop updates can't ride along there. Skip when nothing changed —
  // `VueRenderer.updateProps` always re-renders, so an unconditional push would
  // re-render every widget on every transaction.
  const existing = cache.renderers.get(key)

  if (existing) {
    const previous = cache.props.get(key)

    if (!previous || !shallowEqual(previous, props)) {
      existing.updateProps(props)
      cache.props.set(key, { ...props })
    }
  }

  const render = (_view: EditorView, getPos: () => number | undefined): HTMLElement => {
    let renderer = cache.renderers.get(key)

    // `editor` is a large, circular ProseMirror object. It must be passed raw —
    // `VueRenderer` wraps props in `reactive()`, and letting Vue deeply proxy the
    // editor (and its view/plugin/DOM graph) recurses and crashes. `markRaw` opts
    // it out of reactivity.
    const rawContext = {
      editor: markRaw(editor),
      getPos,
    }

    if (renderer) {
      renderer.updateProps(rawContext)
    } else {
      renderer = new VueRenderer(component, {
        editor,
        props: { ...props, ...rawContext },
      })
      cache.renderers.set(key, renderer)
      cache.props.set(key, { ...props })
    }

    return renderer.element as HTMLElement
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
      cache.props.delete(key)
    },
  })
}
