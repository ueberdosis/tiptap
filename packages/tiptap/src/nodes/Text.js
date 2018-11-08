import Node from '../Utils/Node'

export default class Text extends Node {

  get name() {
    return 'text'
  }

  get schema() {
    return {
      group: 'inline',
    }
  }

}
