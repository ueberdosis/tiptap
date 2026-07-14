import { decoration, liveWidgetKeys } from '@tiptap/core'
import type {
  Editor as CoreEditor,
  WidgetDecorationDescriptor,
  WidgetDecorationOptions,
} from '@tiptap/core'
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
   * A stable, position-independent identifier for the widget. Reusing the same
   * key across renders lets ProseMirror keep the component mounted (no flicker /
   * no lost state) and lets this renderer reuse the underlying `VueRenderer`.
   *
   * Good: `comment-${id}`, `paragraph-${node.attrs.id}`, `suggestion-${id}`
   * Bad:  paragraph index, document position, loop counter
   */
  key: string
  /**
   * Props passed to the component (merged with {@link VueWidgetDecorationProps}).
   * The component must render a single root element.
   */
  props?: P
}

const WIDGET_CACHE = Symbol('tiptapVue2WidgetCache')

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
 * Renders a Vue 2 component into a ProseMirror widget decoration, reusing
 * Tiptap's existing `VueRenderer` so the component is mounted under the editor's
 * content component (inject/provide works as usual).
 *
 * Returns a {@link WidgetDecorationDescriptor} ready to return from an
 * extension's `addDecorations().create()`, alongside `decoration.node` /
 * `decoration.inline`. The component must render a single root element.
 *
 * Widget behavior options such as `stopEvent`, `ignoreSelection`, `side`, and
 * `relaxedSide` are passed through to ProseMirror. Use a stable `key` for
 * stateful widgets.
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
export function VueWidgetRenderer<P extends Record<string, any> = object>(
  component: Component,
  options: VueWidgetRendererOptions<P>,
): WidgetDecorationDescriptor {
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

  // Two-phase prop update. ProseMirror skips the widget's `toDOM`/`render` when
  // it reuses an existing widget's DOM, so the `render` callback below is NOT a
  // reliable channel for prop changes. `create()` re-runs on every recompute, so
  // this is the place to push fresh user props to an already-mounted widget.
  // `VueRenderer.updateProps` MERGES into the existing props, so `editor` /
  // `getPos` pushed by the previous `render` are preserved by this partial
  // update. Skip when nothing changed.
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
      const mountProps = { ...props, editor, getPos }

      // Use the editor's own Vue constructor so the widget shares its context,
      // and auto-declare every passed prop so the component receives them even
      // if it didn't list them. `view` is intentionally not passed — Vue 2
      // deeply observes prop values, and observing a ProseMirror view is both
      // expensive and corrupts its internals.
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

  return decoration.widget(pos, render, {
    key,
    side,
    relaxedSide,
    marks,
    stopEvent,
    ignoreSelection,
    destroy: (rendererElement: Node) => {
      // Keep the renderer if the key is still a live widget decoration (it's
      // being reassigned/recreated, not removed). `liveWidgetKeys` reflects the
      // current state, so this is correct even when nothing recomputed.
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
