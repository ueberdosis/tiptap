import Vue from 'vue'

export default class ComponentView {
	constructor(component, {
    node,
    view,
    getPos,
    decorations,
    editable,
  }) {
    this.component = component
    this.node = node
    this.view = view
    this.getPos = getPos
    this.decorations = decorations
    this.editable = editable

    this.dom = this.createDOM()
    this.contentDOM = this._vm.$refs.content
	}

  createDOM() {
    const Component = Vue.extend(this.component)
    this._vm = new Component({
      propsData: {
        node: this.node,
        view: this.view,
        getPos: this.getPos,
        decorations: this.decorations,
        editable: this.editable,
        updateAttrs: attrs => this.updateAttrs(attrs),
        updateContent: content => this.updateContent(content),
      },
    }).$mount()
    return this._vm.$el
  }

  updateAttrs(attrs) {
    const transaction = this.view.state.tr.setNodeMarkup(this.getPos(), null, {
      ...this.node.attrs,
      ...attrs,
    })
    this.view.dispatch(transaction)
  }

  updateContent(content) {
		const transaction = this.view.state.tr.setNodeMarkup(this.getPos(), this.node.type, { content })
		this.view.dispatch(transaction)
  }

  ignoreMutation() {
    return true
  }

	update(node, decorations) {
    if (node.type !== this.node.type) {
      return false
    }

    if (node === this.node && this.decorations === decorations) {
			return true
		}

    this.node = node
    this.decorations = decorations
    this._vm._props.node = node
    this._vm._props.decorations = decorations
		return true
	}

  destroy() {
    this._vm.$destroy()
  }
}
