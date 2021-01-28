/**
 * Optionally calls `value` as a function.
 * Otherwise it is returned directly.
 * @param value Function or any value.
 * @param context Optional context to bind to function.
 */
export default function callOrReturn(value: any, context?: any): any {
  if (typeof value === 'function') {
    if (context) {
      return value.bind(context)()
    }

    return value()
  }

  return value
}
