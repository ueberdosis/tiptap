import Extension from './Extension'

export default abstract class Node extends Extension {

  constructor(options = {}) {
    super(options)
  }

  public type = 'node'

  public topNode = false

  // get type() {
  //   return 'node'
  // }

  // get view(): any {
  //   return null
  // }

  // get schema(): any {
  //   return null
  // }

  public abstract schema: any
  // public abstract plugins?: any

  // command() {
  //   return () => {}
  // }

}
