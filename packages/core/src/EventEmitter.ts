export default class EventEmitter {

  _callbacks: { [key: string]: Function[] } = {}

  on(event: string, fn: Function) {
    if (!this._callbacks[event]) {
      this._callbacks[event] = []
    }

    this._callbacks[event].push(fn)
    
    return this
  }

  emit(event: string, ...args: any) {
    const callbacks = this._callbacks[event]

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args))
    }

    return this
  }

  off(event: string, fn?: Function) {
    const callbacks = this._callbacks[event]

    if (callbacks) {
      if (fn) {
        this._callbacks[event] = callbacks.filter(callback => callback !== fn)
      } else {
        delete this._callbacks[event]
      }
    }

    return this
  }

  removeAllListeners() {
    this._callbacks = {}
  }
}
