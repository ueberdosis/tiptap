import type { EditorView } from '@tiptap/pm/view'

import type { Editor } from '../Editor.js'
import { attrsEqual } from '../utilities/attrsEqual.js'
import { Decoration } from './Decoration.js'
import type { WidgetDecoration, WidgetDecorationOptions } from './Decoration.js'
import { liveWidgetKeys } from './DecorationManager.js'

/**
 * The minimum a framework renderer must provide to be driven by
 * {@link createWidgetDecoration}. Both `ReactRenderer` and `VueRenderer` match it.
 */
export interface WidgetRenderer {
  updateProps: (props: Record<string, any>) => void
  destroy: () => void
}

interface WidgetCache<TRenderer extends WidgetRenderer> {
  /**
   * The live renderer for each widget key, reused across recomputes so the
   * component and its state are preserved instead of remounted.
   */
  renderers: Map<string, TRenderer>
  /**
   * Last props pushed to each widget. Skips updates when nothing changed.
   */
  props: Map<string, Record<string, any>>
  /**
   * Props queued during `create()` and pushed on the next microtask.
   * Last write wins per key.
   */
  pendingProps: Map<string, Record<string, any>>
  flushScheduled: boolean
}

export interface CreateWidgetDecorationOptions<
  TRenderer extends WidgetRenderer,
> extends WidgetDecorationOptions {
  /**
   * The editor instance. The renderer cache is stored on it, so widgets are
   * swept when the editor is destroyed.
   */
  editor: Editor
  /**
   * The document position the widget is rendered at.
   */
  pos: number
  /**
   * A stable, position-independent identifier for the widget. Reusing the same
   * key keeps the component mounted across recomputes.
   */
  key: string
  /**
   * Props passed to the component, merged with {@link context} on every render.
   */
  props: Record<string, any>
  /**
   * The symbol the renderer cache is stored under on the editor. Use one
   * dedicated symbol per framework package so caches never mix.
   */
  cacheKey: symbol
  /**
   * Extra props merged into every render, for example `editor` and `getPos`.
   * Called on each materialization because `getPos` is view-bound.
   */
  context: (getPos: () => number | undefined) => Record<string, any>
  /**
   * Creates the renderer on first mount. Receives `props` and `context`
   * already merged.
   */
  create: (props: Record<string, any>) => TRenderer
  /**
   * Returns the element ProseMirror inserts, plus any work that has to happen
   * on every materialization (React re-registers its portal here).
   */
  materialize: (renderer: TRenderer) => HTMLElement
}

function getCache<TRenderer extends WidgetRenderer>(
  editor: Editor,
  cacheKey: symbol,
): WidgetCache<TRenderer> {
  const host = editor as Editor & Record<symbol, WidgetCache<TRenderer> | undefined>

  let cache = host[cacheKey]

  if (!cache) {
    cache = {
      renderers: new Map(),
      props: new Map(),
      pendingProps: new Map(),
      flushScheduled: false,
    }

    host[cacheKey] = cache

    const sweep = cache

    // Sweep any widgets still mounted when the editor goes away.
    editor.on('destroy', () => {
      sweep.pendingProps.clear()
      sweep.renderers.forEach(renderer => renderer.destroy())
      sweep.renderers.clear()
      sweep.props.clear()
    })
  }

  return cache
}

function flushPendingProps<TRenderer extends WidgetRenderer>(cache: WidgetCache<TRenderer>): void {
  cache.flushScheduled = false

  for (const [key, props] of cache.pendingProps) {
    const renderer = cache.renderers.get(key)

    if (renderer) {
      renderer.updateProps(props)
      cache.props.set(key, { ...props })
    }
  }

  cache.pendingProps.clear()
}

/**
 * Builds a widget decoration backed by a framework component renderer.
 *
 * Owns everything that is not framework specific: the per-editor renderer
 * cache, prop diffing, the deferred prop flush, the key reassignment guard and
 * the ProseMirror option pass-through. Framework packages supply only `create`,
 * `context` and `materialize`.
 *
 * @param options The widget options plus the three framework hooks.
 * @returns The widget decoration to return from `addDecorations`.
 * @example
 * createWidgetDecoration<ReactRenderer>({
 *   editor, pos, key, props, cacheKey: WIDGET_CACHE,
 *   context: getPos => ({ editor, getPos }),
 *   create: renderProps => new ReactRenderer(component, { editor, props: renderProps }),
 *   materialize: renderer => renderer.element,
 * })
 */
export function createWidgetDecoration<TRenderer extends WidgetRenderer>(
  options: CreateWidgetDecorationOptions<TRenderer>,
): WidgetDecoration {
  const {
    editor,
    pos,
    key,
    props,
    cacheKey,
    context,
    create,
    materialize,
    side,
    relaxedSide,
    marks,
    stopEvent,
    ignoreSelection,
    destroy,
  } = options
  const cache = getCache<TRenderer>(editor, cacheKey)

  // Queue prop updates for already-mounted widgets. This code runs inside
  // ProseMirror's `state.apply`, which must stay pure, so the renderer is only
  // touched on the next microtask. ProseMirror skips `render` when it reuses
  // DOM, so the flush is the only update path for a mounted widget.
  if (cache.renderers.has(key)) {
    const previous = cache.pendingProps.get(key) ?? cache.props.get(key)

    if (!previous || !attrsEqual(previous, props)) {
      cache.pendingProps.set(key, props)

      if (!cache.flushScheduled) {
        cache.flushScheduled = true
        queueMicrotask(() => flushPendingProps(cache))
      }
    }
  }

  const render = (_view: EditorView, getPos: () => number | undefined): HTMLElement => {
    const renderProps = { ...props, ...context(getPos) }
    let renderer = cache.renderers.get(key)

    if (renderer) {
      renderer.updateProps(renderProps)
    } else {
      renderer = create(renderProps)
      cache.renderers.set(key, renderer)
      cache.props.set(key, { ...props })
    }

    return materialize(renderer)
  }

  return Decoration.Widget(pos, render, {
    key,
    side,
    relaxedSide,
    marks,
    stopEvent,
    ignoreSelection,
    destroy: (rendererElement: globalThis.Node) => {
      // Keep the renderer if the widget is still live (being reassigned, not removed).
      // Only correct because ProseMirror sets `view.state` before dropping widget descs.
      if (liveWidgetKeys(editor).has(key)) {
        return
      }

      try {
        cache.renderers.get(key)?.destroy()
        cache.renderers.delete(key)
        cache.props.delete(key)
        cache.pendingProps.delete(key)
      } finally {
        destroy?.(rendererElement)
      }
    },
  })
}
