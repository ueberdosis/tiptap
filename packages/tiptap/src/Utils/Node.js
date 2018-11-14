import Extension from './Extension'

export default class Node extends Extension {

  constructor(options = {}) {
    super(options)
  }

  get type() {
    return 'node'
  }

  get view() {
    return null
  }

  get schema() {
    return null
  }

  command() {
    return () => {}
  }

}
