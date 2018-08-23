export default class Node {

	constructor(options = {}) {
		this.options = {
			...this.defaultOptions,
			...options,
		}
	}

	get name() {
		return null
	}

	get defaultOptions() {
		return {}
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

	get plugins() {
		return []
	}

	command() {
		return () => {}
	}

	keys() {
		return {}
	}

	inputRules() {
		return []
	}

}
