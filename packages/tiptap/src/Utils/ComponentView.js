import Vue from 'vue'

export default class ComponentView {

  constructor(component, {
    extension,
    parent,
    node,
    view,
    getPos,
    decorations,
    editable,
    extraProps,
  }) {
    this.component = component
    this.extension = extension
    this.parent = parent
    this.node = node
    this.view = view
    this.getPos = getPos
    this.decorations = decorations
    this.editable = editable
    this.selected = false
    this.extraProps = extraProps

    this.dom = this.createDOM()
    this.contentDOM = this.vm.$refs.content
  }

  createDOM() {
    const Component = Vue.extend(this.component)
    this.vm = new Component({
      parent: this.parent,
      propsData: {
        node: this.node,
        view: this.view,
        getPos: this.getPos,
        decorations: this.decorations,
        editable: this.editable,
        extraProps: this.extraProps,
        selected: false,
        options: this.extension.options,
        updateAttrs: attrs => this.updateAttrs(attrs),
        updateContent: content => this.updateContent(content),
      },
    }).$mount()
    return this.vm.$el
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

    this.updateComponentProps({
      node,
      decorations,
    })

    return true
  }

  updateComponentProps(props) {
    // Update props in component
    // TODO: Avoid mutating a prop directly.
    // Maybe there is a better way to do this?
    const originalSilent = Vue.config.silent
    Vue.config.silent = true

    Object.entries(props).forEach(([key, value]) => {
      this.vm._props[key] = value
    })
    // this.vm._props.node = node
    // this.vm._props.decorations = decorations
    Vue.config.silent = originalSilent
  }

  updateAttrs(attrs) {
    if (!this.editable) {
      return
    }

    const transaction = this.view.state.tr.setNodeMarkup(this.getPos(), null, {
      ...this.node.attrs,
      ...attrs,
    })
    this.view.dispatch(transaction)
  }

  updateContent(content) {
    if (!this.editable) {
      return
    }

    const transaction = this.view.state.tr.setNodeMarkup(this.getPos(), this.node.type, { content })
    this.view.dispatch(transaction)
  }

  // prevent a full re-render of the vue component on update
  // we'll handle prop updates in `update()`
  ignoreMutation() {
    return true
  }

  // disable (almost) all prosemirror event listener for node views
  stopEvent(event) {
    if (typeof this.extension.stopEvent === 'function') {
      return this.extension.stopEvent(event)
    }

    const isPaste = event.type === 'paste'
    const draggable = !!this.extension.schema.draggable

    if (draggable || isPaste) {
      return false
    }

    return true
  }

  selectNode() {
    this.updateComponentProps({
      selected: true,
    })
  }

  deselectNode() {
    this.updateComponentProps({
      selected: false,
    })
  }

  destroy() {
    this.vm.$destroy()
  }

}
