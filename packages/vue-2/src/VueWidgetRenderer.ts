import { createWidgetDecoration } from '@tiptap/editor'
import type {
  Editor as CoreEditor,
  WidgetDecoration,
  WidgetDecorationOptions,
  WidgetRenderer,
} from '@tiptap/editor'
import type { Component, VueConstructor } from 'vue'

import type { Editor } from './Editor.js'
import { createWidgetConstructor } from './utils/createWidgetConstructor.js'
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

/** The `VueRenderer` plus the warning wrapper the widget cache drives. */
interface WidgetRendererEntry extends WidgetRenderer {
  renderer: VueRenderer
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

// Wrap the renderer so every prop push warns, whether it comes from the first
// render or from the deferred flush.
function withPropWarnings(renderer: VueRenderer, key: string): WidgetRendererEntry {
  return {
    renderer,
    updateProps: props => {
      warnUndeclaredProps(renderer, props, key)
      renderer.updateProps(props)
    },
    destroy: () => renderer.destroy(),
  }
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
  const { editor, key, props = {} as P } = options

  return createWidgetDecoration<WidgetRendererEntry>({
    // Forwards editor, pos, key and the ProseMirror widget options unchanged.
    ...options,
    props,
    cacheKey: WIDGET_CACHE,
    // `view` is not passed on purpose: Vue 2 deeply observes props and
    // observing a ProseMirror view corrupts its internals.
    context: getPos => ({ editor, getPos }),
    create: renderProps => {
      const base = (editor.contentComponent?.$options as any)?._base as VueConstructor | undefined
      const Constructor = createWidgetConstructor(base, component, renderProps)

      return withPropWarnings(
        new VueRenderer(Constructor, {
          parent: editor.contentComponent,
          propsData: renderProps,
        }),
        key,
      )
    },
    materialize: entry => entry.renderer.element as HTMLElement,
  })
}
