type StringKeyOf<T> = Extract<keyof T, string>
type CallbackType<
  T extends Record<string, any>,
  EventName extends StringKeyOf<T>,
> = T[EventName] extends any[] ? T[EventName] : [T[EventName]]
type CallbackFunction<
  T extends Record<string, any>,
  EventName extends StringKeyOf<T>,
> = (...props: CallbackType<T, EventName>) => any

export class EventEmitter<T extends Record<string, any>> {

  private callbacks: { [key: string]: Function[] } = {}

  public on<EventName extends StringKeyOf<T>>(event: EventName, fn: CallbackFunction<T, EventName>): this {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }

    this.callbacks[event].push(fn)

    return this
  }

  protected emit<EventName extends StringKeyOf<T>>(event: EventName, ...args: CallbackType<T, EventName>): this {
    const callbacks = this.callbacks[event]

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args))
    }

    return this
  }

  public off<EventName extends StringKeyOf<T>>(event: EventName, fn?: CallbackFunction<T, EventName>): this {
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
