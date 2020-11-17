export default class NodeSlotView {

  constructor(parentComponent, {
    editor,
    extension,
    node,
    view,
    getPos,
    decorations,
  }) {
    this.parentComponent = parentComponent
    this.editor = editor
    this.extension = extension
    this.node = node
    this.view = view
    this.getPos = getPos
    this.decorations = decorations
  }
}
