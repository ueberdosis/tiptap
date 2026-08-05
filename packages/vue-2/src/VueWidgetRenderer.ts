import { Decoration, liveWidgetKeys } from '@tiptap/core'
import type { Editor as CoreEditor, WidgetDecoration, WidgetDecorationOptions } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { Component, VueConstructor } from 'vue'

import type { Editor } from './Editor.js'
import { Vue } from './Vue.js'
import { VueRenderer } from './VueRenderer.js'

/**
 * Props every widget-decoration component receives in addition to the props you
 * pass through `VueWidgetRenderer`. Declare the ones you use on your component.
 */
export interface VueWidgetDecorationProps {
  editor: CoreEditor
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
   * The component must render a single root element.
   */
  props?: P
}

const WIDGET_CACHE = Symbol('tiptapVue2WidgetCache')

// @ts-ignore
const isDev = process.env.NODE_ENV !== 'production'

interface WidgetCache {
  /**
   * The live renderer for each widget key. Reused across recomputes so the
   * Vue component (and its state) is preserved instead of remounted.
   */
  renderers: Map<string, VueRenderer>
  /**
   * The last props pushed to each widget, used to skip needless updates.
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

// Vue 2 fixes the prop list at construction. Keys absent on first mount are
// never declared, so updateProps silently drops them on later updates.
function warnUndeclaredProps(renderer: VueRenderer, props: Record<string, any>, key: string): void {
  if (!isDev) {
    return
  }

  const declared = renderer.ref.$props ?? {}

  for (const name of Object.keys(props)) {
    if (!(name in declared)) {
      console.warn(
        `[tiptap warn]: VueWidgetRenderer prop "${name}" was not passed on first mount for widget "${key}".`,
        'Vue 2 cannot declare new props after mount, so this value is ignored.',
      )
    }
  }
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
 * Renders a Vue 2 component into a ProseMirror widget decoration.
 * Reuses Tiptap's `VueRenderer` so the component is mounted under the editor's
 * content component (inject/provide works as usual). Use a stable `key` for
 * stateful widgets. The component must render a single root element.
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
  // place. Skip when nothing changed.
  const existing = cache.renderers.get(key)

  if (existing) {
    const previous = cache.props.get(key)

    if (!previous || !shallowEqual(previous, props)) {
      warnUndeclaredProps(existing, props, key)
      existing.updateProps(props)
      cache.props.set(key, { ...props })
    }
  }

  const render = (_view: EditorView, getPos: () => number | undefined): HTMLElement => {
    let renderer = cache.renderers.get(key)

    if (renderer) {
      warnUndeclaredProps(renderer, props, key)
      renderer.updateProps({ ...props, editor, getPos })
    } else {
      const mountProps = { ...props, editor, getPos }

      // Use the editor's Vue constructor so the widget shares its context.
      // Auto-declare all passed props so the component receives them even if
      // not listed. `view` is not passed — Vue 2 deeply observes props and
      // observing a ProseMirror view corrupts its internals.
      const base = (editor.contentComponent?.$options as any)?._base as VueConstructor | undefined
      const VueBase = base ?? Vue
      const Component = VueBase.extend(component as any)
      const declaredProps = {
        ...(Component as unknown as { options: { props?: Record<string, any> } }).options.props,
      }

      for (const name of Object.keys(mountProps)) {
        if (!Object.prototype.hasOwnProperty.call(declaredProps, name)) {
          declaredProps[name] = null
        }
      }

      const Constructor = Component.extend({
        props: declaredProps,
      })

      renderer = new VueRenderer(Constructor, {
        parent: editor.contentComponent,
        propsData: mountProps,
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
