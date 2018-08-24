export default class Extension {

	constructor(options = {}) {
		this.options = {
			...this.defaultOptions,
			...options,
		}
	}

	get name() {
		return null
	}

	get type() {
		return 'extension'
	}

	get defaultOptions() {
		return {}
	}

	get plugins() {
		return []
	}

	inputRules() {
		return []
	}

}
