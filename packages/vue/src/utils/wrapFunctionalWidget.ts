import type { FunctionalComponent } from 'vue'

import { undeclaredWidgetProps } from './undeclaredWidgetProps.js'

type PropsOption = FunctionalComponent['props']

/** Keeps an array declaration an array, so Vue does not read numeric keys as prop names. */
function mergePropsOption(declared: PropsOption, undeclared: Record<string, null>): PropsOption {
  if (Array.isArray(declared)) {
    return [...declared, ...Object.keys(undeclared)]
  }

  return { ...(declared as object), ...undeclared } as PropsOption
}

/**
 * Wraps a functional component so it can be used as a widget decoration.
 *
 * A functional component is its own render function, so the options wrapper
 * used for object components would spread it away and leave Vue with nothing
 * to render.
 *
 * @param component The functional component.
 * @param props The props passed through `VueWidgetRenderer`.
 * @returns A functional component declaring the widget props.
 * @example
 * wrapFunctionalWidget(props => h('span', props.label), { label: 'a' })
 */
export function wrapFunctionalWidget(
  component: FunctionalComponent,
  props: Record<string, any>,
): FunctionalComponent {
  const wrapped: FunctionalComponent = (componentProps, context) =>
    component(componentProps, context)

  wrapped.props = mergePropsOption(component.props, undeclaredWidgetProps(component, props))
  wrapped.emits = component.emits
  wrapped.inheritAttrs = component.inheritAttrs
  wrapped.displayName = component.displayName ?? component.name

  return wrapped
}
