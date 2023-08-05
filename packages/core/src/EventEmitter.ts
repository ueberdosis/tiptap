type StringKeyOf<T> = Extract<keyof T, string>
type CallbackType<
  T extends Record<string, any>,
  EventName extends StringKeyOf<T>,
> = T[EventName] extends any[] ? T[EventName] : [T[EventName]]
type CallbackFunction<
  T extends Record<string, any>,
  EventName extends StringKeyOf<T>,
> = (...props: CallbackType<T, EventName>) => any

/**
 * The Tiptap EventEmitter class.
 * This class is used to emit events and listen to them.
 */
export class EventEmitter<T extends Record<string, any>> {

  /**
   * Callback functions for the events.
   */
  private callbacks: { [key: string]: Function[] } = {}

  /**
   * Registers a new event listener.
   * @param event the event name
   * @param fn the callback function for the event
   * @returns {EventEmitter}
   */
  public on<EventName extends StringKeyOf<T>>(event: EventName, fn: CallbackFunction<T, EventName>): this {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }

    this.callbacks[event].push(fn)

    return this
  }

  /**
   * Emits an event to all registered listeners.
   * @param event the event name
   * @param args the arguments for the callback function
   * @returns {EventEmitter}
   */
  protected emit<EventName extends StringKeyOf<T>>(event: EventName, ...args: CallbackType<T, EventName>): this {
    const callbacks = this.callbacks[event]

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args))
    }

    return this
  }

  /**
   * Removes a listener from the event.
   * @param event The event name
   * @param fn The callback function
   * @returns {EventEmitter}
   */
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

  /**
   * Removes all listeners from all events.
   */
  protected removeAllListeners(): void {
    this.callbacks = {}
  }
}
