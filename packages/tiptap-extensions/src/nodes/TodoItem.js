import { Node } from 'tiptap'
import { splitListItem, liftListItem } from 'tiptap-commands'

export default class TodoItemNode extends Node {

	get name() {
		return 'todo_item'
	}

	get view() {
		return {
			props: ['node', 'updateAttrs', 'editable'],
			methods: {
				onChange() {
					this.updateAttrs({
						done: !this.node.attrs.done,
					})
				},
			},
			template: `
				<li data-type="todo_item" :data-done="node.attrs.done.toString()">
					<span class="todo-checkbox" contenteditable="false" @click="onChange"></span>
					<div class="todo-content" ref="content" :contenteditable="editable.toString()"></div>
					<div>
						{{ node.attrs.customProp }}
					</DIV>
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
				customProp: {
					default: null,
				},
			},
			draggable: false,
			content: 'paragraph',
			toDOM(node) {
				const { done, customProp } = node.attrs

				return ['li', {
						'data-type': 'todo_item',
						'data-done': done.toString(),
						'custom-prop': customProp.toString(),
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
					customProp: dom.getAttribute('custom-prop'),
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
