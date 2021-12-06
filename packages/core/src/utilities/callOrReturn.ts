import { MaybeReturnType } from '../types'
import { isFunction } from './isFunction'

/**
 * Optionally calls `value` as a function.
 * Otherwise it is returned directly.
 * @param value Function or any value.
 * @param context Optional context to bind to function.
 * @param props Optional props to pass to function.
 */
export function callOrReturn<T>(value: T, context: any = undefined, ...props: any[]): MaybeReturnType<T> {
  if (isFunction(value)) {
    if (context) {
      return value.bind(context)(...props)
    }

    return value(...props)
  }

  return value as MaybeReturnType<T>
}
