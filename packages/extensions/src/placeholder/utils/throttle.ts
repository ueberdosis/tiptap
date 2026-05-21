export function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): { call: T; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const call = ((...args: any[]) => {
    if (timer) {
      return
    }

    // Leading-edge: fire immediately, then prevent subsequent calls
    // until the timer fires and resets.
    fn(...args)
    timer = setTimeout(() => {
      timer = null
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
