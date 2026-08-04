import { Decoration, liveWidgetKeys } from '@tiptap/core'
import type { Editor, WidgetDecoration, WidgetDecorationOptions } from '@tiptap/core'
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

export interface VueWidgetRendererOptions<
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
   * Props passed to the component (merged with {@link VueWidgetDecorationProps}).
   * The component must have a single root element.
   */
  props?: P
}

const WIDGET_CACHE = Symbol('tiptapVueWidgetCache')

interface WidgetCache {
  /**
   * The live renderer for each widget key, reused across recomputes
   * so the Vue component and its state are preserved.
   */
  renderers: Map<string, VueRenderer>
  /**
   * Last props pushed to each widget. Skips re-renders when nothing changed.
   */
  props: Map<string, Record<string, any>>
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
 * Renders a Vue component into a ProseMirror widget decoration.
 * Reuses Tiptap's `VueRenderer` so the component shares the editor's app
 * context (provide/inject works as usual). Use a stable `key` for stateful
 * widgets. The component must render a single root element.
 * @example
 * addDecorations() {
 *   return {
 *     create: ({ editor, state }) =>
 *       findMatches(state.doc).map(match =>
 *         VueWidgetRenderer(MyWidget, {
 *           editor, pos: match.pos, key: `match-${match.id}`,
 *           props: { label: match.label },
 *         }),
 *       ),
 *   }
 * }
 */
export function VueWidgetRenderer<P extends Record<string, any> = object>(
  component: Component,
  options: VueWidgetRendererOptions<P>,
): WidgetDecoration {
  const {
    editor,
    pos,
    key,
    props = {} as P,
    side,
    relaxedSide,
    marks,
    stopEvent,
    ignoreSelection,
    destroy,
  } = options
  const cache = getCache(editor)

  // Push fresh props to already-mounted widgets here, not in `render`.
  // ProseMirror skips `render` when reusing DOM, so this is the only reliable
  // place. Skip when nothing changed to avoid re-rendering every widget.
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

    // `editor` must be markRaw — VueRenderer wraps props in reactive(),
    // and deeply proxying the editor's view/DOM graph recurses and crashes.
    const rawContext = {
      editor: markRaw(editor),
      getPos,
    }

    if (renderer) {
      renderer.updateProps({ ...props, ...rawContext })
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

  return Decoration.Widget(pos, render, {
    key,
    side,
    relaxedSide,
    marks,
    stopEvent,
    ignoreSelection,
    destroy: (rendererElement: Node) => {
      // Keep the renderer if the widget is still live (being reassigned, not removed).
      if (liveWidgetKeys(editor).has(key)) {
        return
      }

      try {
        cache.renderers.get(key)?.destroy()
        cache.renderers.delete(key)
        cache.props.delete(key)
      } finally {
        destroy?.(rendererElement)
      }
    },
  })
}
