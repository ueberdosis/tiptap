import Extension from './Extension'

export default abstract class Node extends Extension {

  constructor(options = {}) {
    super(options)
  }

  public type = 'node'

  public topNode = false

  schema(): any {
    return null
  }

}
