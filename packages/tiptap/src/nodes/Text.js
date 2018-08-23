import Node from '../utils/node'

export default class TextNode extends Node {

	get name() {
		return 'text'
	}

	get schema() {
		return {
			group: 'inline',
		}
	}

}
