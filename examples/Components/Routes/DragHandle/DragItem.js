import { Node } from 'tiptap'

export default class DragItem extends Node {

  get name() {
    return 'drag_item'
  }

  get schema() {
    return {
      group: 'block',
      draggable: true,
      content: 'paragraph+',
      toDOM: () => ['div', { 'data-type': this.name }, 0],
      parseDOM: [{
        tag: `[data-type="${this.name}"]`,
      }],
    }
  }
  // Attention! For the data-drag-handle to work, the component must contain another element with `ref="content"` somewhere (it can be invisible).
  get view() {
    return {
      template: `
        <div data-type="drag_item" contenteditable="false">
          <div ref="content" contenteditable="true"></div>
          <div data-drag-handle></div>
        </div>
      `,
    }
  }

}
