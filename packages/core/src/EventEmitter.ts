export default class EventEmitter {

  private callbacks: { [key: string]: Function[] } = {}

  public on(event: string, fn: Function): this {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }

    this.callbacks[event].push(fn)

    return this
  }

  protected emit(event: string, ...args: any): this {
    const callbacks = this.callbacks[event]

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args))
    }

    return this
  }

  public off(event: string, fn?: Function): this {
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
