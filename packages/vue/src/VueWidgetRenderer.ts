import { createWidgetDecoration } from '@tiptap/core'
import type { Editor, WidgetDecoration, WidgetDecorationOptions } from '@tiptap/core'
import type { Component, FunctionalComponent, SetupContext } from 'vue'
import { defineComponent, markRaw } from 'vue'

import { undeclaredWidgetProps } from './utils/undeclaredWidgetProps.js'
import { wrapFunctionalWidget } from './utils/wrapFunctionalWidget.js'
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
   *
   * @remarks Props are deeply wrapped in `reactive()` by `VueRenderer`. The
   *   `editor` is protected with `markRaw`; any other non-reactive objects you
   *   pass (ProseMirror nodes, views, editor refs, ...) are not. Mark them raw
   *   yourself when reactivity would cause recursion or unwanted tracking.
   */
  props?: P
}

const WIDGET_CACHE = Symbol('tiptapVueWidgetCache')

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
  const { editor, props = {} as P } = options

  // A functional component is its own render function, so it cannot go through
  // the options wrapper below.
  const wrappedComponent = isFunctionalComponent(component)
    ? wrapFunctionalWidget(component, props)
    : buildOptionsWidget(component, props)

  return createWidgetDecoration<VueRenderer>({
    // Forwards editor, pos, key and the ProseMirror widget options unchanged.
    ...options,
    props,
    cacheKey: WIDGET_CACHE,
    // VueRenderer wraps props in reactive(), deeply proxying every object.
    // `editor` is markRaw so proxying its view/DOM graph does not crash.
    // User props are NOT auto-protected: markRaw any ProseMirror nodes,
    // views, editor refs, or other objects reactivity would harm.
    context: getPos => ({ editor: markRaw(editor), getPos }),
    create: renderProps => new VueRenderer(wrappedComponent, { editor, props: renderProps }),
    materialize: renderer => renderer.element as HTMLElement,
  })
}

function isFunctionalComponent(component: Component): component is FunctionalComponent {
  return typeof component === 'function'
}

/**
 * Wraps an object component so the widget props are declared on it. Everything
 * Vue reads off the original options has to be carried over by hand, because
 * `extends` alone does not apply to `template`, `setup` or the compiler keys.
 */
function buildOptionsWidget(component: Component, props: Record<string, any>) {
  return defineComponent({
    extends: { ...(component as any) },
    // Only declare what the component does not declare itself. Redeclaring a
    // prop here would replace its type, default and validator with an empty one.
    props: undeclaredWidgetProps(component, props),
    template: (component as any).template,
    // Vue only calls the outermost `setup`, so run the component's own setup and
    // forward the full context, otherwise `emit`, `slots` and `attrs` are missing.
    setup: (reactiveProps: any, context: SetupContext) =>
      (component as any).setup?.(reactiveProps, context),
    __scopeId: (component as any).__scopeId,
    __cssModules: (component as any).__cssModules,
    __name: (component as any).__name,
    __file: (component as any).__file,
  })
}
