import Extension from './Extension'

export default class Node extends Extension {

  constructor(options = {}) {
    super(options)
  }

  // protected type = 'node'

  get type() {
    return 'node'
  }

  get view(): any {
    return null
  }

  get schema(): any {
    return null
  }

  command() {
    return () => {}
  }

}
