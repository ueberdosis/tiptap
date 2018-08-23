export default class Mark {

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
		return 'mark'
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
