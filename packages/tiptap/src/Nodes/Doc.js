import Node from '../Utils/Node'

export default class Doc extends Node {

  get name() {
    return 'doc'
  }

  get schema() {
    return {
      content: 'block+',
    }
  }

}
