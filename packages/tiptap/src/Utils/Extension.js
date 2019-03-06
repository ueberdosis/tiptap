export default class Extension {

  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    }
  }

  get name() {
    return null
  }

  get type() {
    return 'extension'
  }

  get update() {
    return () => {}
  }

  get defaultOptions() {
    return {}
  }

  get plugins() {
    return []
  }

  inputRules() {
    return []
  }

  pasteRules() {
    return []
  }

  keys() {
    return {}
  }

}
