import Extension from './Extension'

export default abstract class Node extends Extension {

  constructor(options = {}) {
    super(options)
  }

  // protected type = 'node'

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

  // command() {
  //   return () => {}
  // }

}
