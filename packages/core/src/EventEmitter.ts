type StringKeyOf<T> = Extract<keyof T, string>;
type CallbackType<T extends Record<string, any>, EVENT extends StringKeyOf<T>> = T[EVENT] extends any[] ? T[EVENT] : [T[EVENT]];
type CallbackFunction<T extends Record<string, any>, EVENT extends StringKeyOf<T>> = (...props: CallbackType<T, EVENT>) => any

export default class EventEmitter<T extends Record<string, any>> {

  private callbacks: { [key: string]: Function[] } = {}

  public on<EVENT extends StringKeyOf<T>>(event: EVENT, fn: CallbackFunction<T, EVENT>): this {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }

    this.callbacks[event].push(fn)

    return this
  }

  protected emit<EVENT extends StringKeyOf<T>>(event: EVENT, ...args: CallbackType<T, EVENT>): this {
    const callbacks = this.callbacks[event]

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args))
    }

    return this
  }

  public off<EVENT extends StringKeyOf<T>>(event: EVENT, fn?: CallbackFunction<T, EVENT>): this {
    const callbacks = this.callbacks[event]

    if (callbacks) {
      if (fn) {
        this.callbacks[event] = callbacks.filter(callback => callback !== fn)
      } else {
        delete this.callbacks[event]
      }
    }

    return this
  }

  protected removeAllListeners(): void {
    this.callbacks = {}
  }
}
