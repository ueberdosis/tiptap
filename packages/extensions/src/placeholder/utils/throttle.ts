export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): { call: T; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const call = ((...args: unknown[]) => {
    if (timer) {
      return
    }

    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }) as T

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { call, cancel }
}
