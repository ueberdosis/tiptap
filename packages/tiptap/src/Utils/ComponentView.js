import Vue from 'vue'

import { getMarkRange } from 'tiptap-utils'

export default class ComponentView {

  constructor(component, {
    extension,
    parent,
    node,
    view,
    getPos,
    decorations,
    editable,
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
    this.isNode = this.node.constructor.name === 'Node'
    this.isMark = !this.isNode
    this.dom = this.createDOM()
    this.contentDOM = this.vm.$refs.content

    if (this.isMark) {
      this.getPos = this.getMarkPos
    }
  }

  createDOM() {
    const Component = Vue.extend(this.component)
    this.vm = new Component({
      parent: this.parent,
      propsData: {
        node: this.node,
        view: this.view,
        getPos: () => this.getPos(),
        decorations: this.decorations,
        editable: this.editable,
        selected: false,
        options: this.extension.options,
        updateAttrs: attrs => this.updateAttrs(attrs),
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
    if (!this.vm._props) {
      return
    }

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

    const { state } = this.view
    const { type } = this.node
    const pos = this.getPos()
    const newAttrs = {
      ...this.node.attrs,
      ...attrs,
    }
    const transaction = this.isMark
      ? state.tr
        .removeMark(pos.from, pos.to, type)
        .addMark(pos.from, pos.to, type.create(newAttrs))
      : state.tr.setNodeMarkup(pos, null, newAttrs)

    this.view.dispatch(transaction)
  }

  // prevent a full re-render of the vue component on update
  // we'll handle prop updates in `update()`
  ignoreMutation(mutation) {
    if (!this.contentDOM) {
      return true
    }
    return !this.contentDOM.contains(mutation.target)
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

  getMarkPos() {
    const pos = this.view.posAtDOM(this.dom)
    const resolvedPos = this.view.state.doc.resolve(pos)
    const range = getMarkRange(resolvedPos, this.node.type)
    return range
  }

  destroy() {
    this.vm.$destroy()
  }

}
