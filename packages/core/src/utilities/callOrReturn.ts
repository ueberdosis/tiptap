/**
 * Optionally calls `value` as a function.
 * Otherwise it is returned directly.
 * @param value Function or any value.
 * @param context Optional context to bind to function.
 * @param props Optional props to pass to function.
 */
export default function callOrReturn(value: any, context: any = undefined, ...props: any[]): any {
  if (typeof value === 'function') {
    if (context) {
      return value.bind(context)(...props)
    }

    return value(...props)
  }

  return value
}
