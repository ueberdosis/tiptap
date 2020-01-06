import { Node } from 'tiptap'
import { sinkListItem, splitToDefaultListItem, liftListItem } from 'tiptap-commands'

export default class TodoItem extends Node {

  get name() {
    return 'todo_item'
  }

  get defaultOptions() {
    return {
      nested: false,
    }
  }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'view'],
      methods: {
        onChange() {
          this.updateAttrs({
            done: !this.node.attrs.done,
          })
        },
      },
      template: `
        <li :data-type="node.type.name" :data-done="node.attrs.done.toString()" data-drag-handle>
          <span class="todo-checkbox" contenteditable="false" @click="onChange"></span>
          <div class="todo-content" ref="content" :contenteditable="view.editable.toString()"></div>
        </li>
      `,
      /*
        The render function enables TodoItem to work in `runtimeonly` builds,
        which is required for frameworks requiring strict CSP policies. For
        example, doing this is required in Chrome Extensions. Having both
        the template and the render function ensures there are no issues
        converting the node to JSON and rendering the component.
      */
      render(h) {
        return h('li', {
          attrs: {
            'data-type': this.node.type.name,
            'data-done': this.node.attrs.done.toString(),
            'data-drag-handle': '',
          },
        }, [
          h('span', {
            class: 'todo-checkbox',
            attrs: {
              contenteditable: false,
            },
            on: {
              click: this.onChange,
            },
          }),
          h('div', {
            class: 'todo-content',
            attrs: {
              contenteditable: this.view.editable.toString(),
            },
            ref: 'content',
          }),
        ]);
      },
    }
  }

  get schema() {
    return {
      attrs: {
        done: {
          default: false,
        },
      },
      draggable: true,
      content: this.options.nested ? '(paragraph|todo_list)+' : 'paragraph+',
      toDOM: node => {
        const { done } = node.attrs

        return [
          'li',
          {
            'data-type': this.name,
            'data-done': done.toString(),
          },
          ['span', { class: 'todo-checkbox', contenteditable: 'false' }],
          ['div', { class: 'todo-content' }, 0],
        ]
      },
      parseDOM: [{
        priority: 51,
        tag: `[data-type="${this.name}"]`,
        getAttrs: dom => ({
          done: dom.getAttribute('data-done') === 'true',
        }),
      }],
    }
  }

  keys({ type }) {
    return {
      Enter: splitToDefaultListItem(type),
      Tab: this.options.nested ? sinkListItem(type) : () => {},
      'Shift-Tab': liftListItem(type),
    }
  }

}
