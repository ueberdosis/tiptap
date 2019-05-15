import Vue from 'vue'

export default class ComponentView {

  constructor(component, {
    extension,
    parent,
    node,
    view,
    getPos,
    decorations,
    editor,
  }) {
    this.component = component
    this.extension = extension
    this.parent = parent
    this.node = node
    this.view = view
    this.getPos = getPos
    this.decorations = decorations
    this.editable = editor.options.editable
    this.selected = false
    this.componentProps = {
      node: this.node,
      view: this.view,
      getPos: this.getPos,
      decorations: this.decorations,
      selected: this.selected,
      options: this.extension.options,
      updateAttrs: attrs => this.updateAttrs(attrs),
      updateContent: content => this.updateContent(content),
    }

    this.tiptapProps = editor.tiptapProps
    this.customProps = editor.customProps

    this.dom = this.createDOM()
    this.contentDOM = this.vm.$refs.content
  }

  createDOM() {
    const Component = Vue.extend(this.component)
    this.vm = new Component({
      parent: this.parent,
      propsData: {
        tiptap: this.tiptapProps,
        component: this.componentProps,
        custom: this.customProps,
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

    this.componentProps.node = node
    this.componentProps.decorations = decorations

    return true
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
    this.tiptapProps.selected = true
  }

  deselectNode() {
    this.tiptapProps.selected = false
  }

  destroy() {
    this.vm.$destroy()
  }

}
