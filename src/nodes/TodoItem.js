import { Node } from 'tiptap/utils'
import { splitListItem, liftListItem } from 'tiptap/helpers'

export default class TodoItemNode extends Node {

	get name() {
		return 'todo_item'
	}

	get view() {
		return {
			props: ['node', 'updateAttrs', 'editable'],
			methods: {
				onChange() {
					if (!this.editable) {
						return
					}
					this.updateAttrs({
						done: !this.node.attrs.done,
					})
				},
			},
			template: `
				<li data-type="todo_item" :data-done="node.attrs.done.toString()">
					<span class="todo-checkbox" contenteditable="false" @click="onChange"></span>
					<div class="todo-content" ref="content" :contenteditable="editable.toString()"></div>
				</li>
			`,
		}
	}

	get schema() {
		return {
			attrs: {
				done: {
					default: false,
				},
			},
			draggable: false,
			content: 'paragraph',
			toDOM(node) {
				const { done } = node.attrs

				return ['li', {
						'data-type': 'todo_item',
						'data-done': done.toString(),
					},
					['span', { class: 'todo-checkbox', contenteditable: 'false' }],
					['div', { class: 'todo-content' }, 0],
				]
			},
			parseDOM: [{
				priority: 51,
				tag: '[data-type="todo_item"]',
				getAttrs: dom => ({
					done: dom.getAttribute('data-done') === 'true',
				}),
			}],
		}
	}

	keys({ type }) {
		return {
			Enter: splitListItem(type),
			'Shift-Tab': liftListItem(type),
		}
	}

}
