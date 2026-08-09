import type { Component } from 'vue'
import { camelize } from 'vue'

interface OptionsComponent {
  props?: string[] | Record<string, unknown>
  extends?: Component
  mixins?: Component[]
}

function collectPropNames(component: Component | undefined, names: Set<string>): void {
  const options = component as OptionsComponent | undefined

  if (!options) {
    return
  }

  options.mixins?.forEach(mixin => collectPropNames(mixin, names))
  collectPropNames(options.extends, names)

  const { props } = options

  if (Array.isArray(props)) {
    props.forEach(name => names.add(camelize(name)))
  } else if (props) {
    Object.keys(props).forEach(name => names.add(camelize(name)))
  }
}

/**
 * Builds prop declarations for the widget props a component does not declare itself.
 * Declaring them keeps Vue from rendering them as DOM attributes, while leaving
 * the component's own `type`, `default` and `validator` options untouched.
 *
 * @param component The widget component, including its `extends` and `mixins` chain.
 * @param props The props passed through `VueWidgetRenderer`.
 * @returns A Vue props object for the undeclared keys only.
 * @example
 * undeclaredWidgetProps(MyWidget, { label: 'a' }) // => { editor: null, getPos: null }
 */
export function undeclaredWidgetProps(
  component: Component,
  props: Record<string, any>,
): Record<string, null> {
  const declared = new Set<string>()

  collectPropNames(component, declared)

  const declarations: Record<string, null> = {}

  for (const name of ['editor', 'getPos', ...Object.keys(props)]) {
    if (!declared.has(camelize(name))) {
      declarations[name] = null
    }
  }

  return declarations
}
