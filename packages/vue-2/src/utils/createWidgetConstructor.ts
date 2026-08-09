import type { Component, VueConstructor } from 'vue'

import { Vue } from '../Vue.js'

/**
 * Builds the Vue 2 constructor for a widget component.
 *
 * Extends the editor's own Vue constructor so the widget shares its context,
 * then auto-declares every passed prop the component does not declare itself.
 * Vue 2 fixes the prop list at construction, so undeclared keys would be
 * dropped. Existing declarations keep their type, default and validator.
 *
 * @param base The editor's Vue constructor, or undefined to fall back to `Vue`.
 * @param component The widget component.
 * @param props The props the widget is mounted with.
 * @returns A constructor that accepts every key in `props`.
 * @example
 * createWidgetConstructor(undefined, MyWidget, { editor, getPos, label: 'a' })
 */
export function createWidgetConstructor(
  base: VueConstructor | undefined,
  component: Component,
  props: Record<string, any>,
): VueConstructor {
  const VueBase = base ?? Vue
  const Extended = VueBase.extend(component as any)
  const declaredProps = {
    ...(Extended as unknown as { options: { props?: Record<string, any> } }).options.props,
  }

  for (const name of Object.keys(props)) {
    if (!Object.prototype.hasOwnProperty.call(declaredProps, name)) {
      declaredProps[name] = null
    }
  }

  return Extended.extend({ props: declaredProps })
}
