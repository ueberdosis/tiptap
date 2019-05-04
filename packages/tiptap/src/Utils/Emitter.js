export default class Emitter {
  // Add an event listener for given event
  on(event, fn) {
    this._callbacks = this._callbacks || {}
    // Create namespace for this event
    if (!this._callbacks[event]) {
      this._callbacks[event] = []
    }
    this._callbacks[event].push(fn)
    return this
  }


  emit(event, ...args) {
    this._callbacks = this._callbacks || {}
    const callbacks = this._callbacks[event]

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args))
    }

    return this
  }

  // Remove event listener for given event. If fn is not provided, all event
  // listeners for that event will be removed. If neither is provided, all
  // event listeners will be removed.
  off(event, fn) {
    if (!this._callbacks || (arguments.length === 0)) {
      this._callbacks = {}
      return this
    }

    // specific event
    const callbacks = this._callbacks[event]
    if (!callbacks) {
      return this
    }

    // remove all handlers
    if (arguments.length === 1) {
      delete this._callbacks[event]
      return this
    }

    // remove specific handler
    for (let i = 0; i < callbacks.length; i += 1) {
      const callback = callbacks[i]
      if (callback === fn) {
        callbacks.splice(i, 1)
        break
      }
    }

    return this
  }
}
