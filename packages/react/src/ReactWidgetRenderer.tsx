import { Decoration, liveWidgetKeys } from '@tiptap/core'
import type { Editor, WidgetDecoration, WidgetDecorationOptions } from '@tiptap/core'
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
   * usually inline).
   */
  as?: string
  className?: string
}

const WIDGET_CACHE = Symbol('tiptapReactWidgetCache')

interface WidgetCache {
  /**
   * The live renderer for each widget key, reused across recomputes
   * so the React component and its state are preserved.
   */
  renderers: Map<string, ReactRenderer>
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
  const {
    editor,
    pos,
    key,
    props = {} as P,
    as = 'span',
    className,
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

    if (renderer) {
      renderer.updateProps({ ...props, editor, getPos })
    } else {
      renderer = new ReactRenderer(component, {
        editor,
        as,
        className,
        props: { ...props, editor, getPos },
      })
      cache.renderers.set(key, renderer)
      cache.props.set(key, { ...props })
    }

    // Re-register the portal on every materialization so the editor's
    // content component is available even on late first renders.
    renderer.render()

    return renderer.element
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
