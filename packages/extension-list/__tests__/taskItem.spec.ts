import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '../src/index.js'

describe('TaskItem', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('preserves custom HTML attributes on node update', () => {
    // Extend TaskItem with a custom attribute
    const CustomTaskItem = TaskItem.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          uid: {
            default: null,
            parseHTML: element => element.getAttribute('data-uid'),
            renderHTML: attributes => {
              if (!attributes.uid) {
                return {}
              }
              return { 'data-uid': attributes.uid }
            },
          },
        }
      },
    })

    editor = new Editor({
      extensions: [Document, Paragraph, Text, TaskList, CustomTaskItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false, uid: 'test-uid-123' },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test task' }] }],
              },
            ],
          },
        ],
      },
    })

    // Verify the initial attribute is present - use data-checked selector as node view sets this
    const taskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(taskItemElement).not.toBeNull()
    expect(taskItemElement?.getAttribute('data-uid')).toBe('test-uid-123')
    expect(taskItemElement?.getAttribute('data-checked')).toBe('false')

    // Update the task item (toggle checked status)
    // Position cursor inside the task item first
    editor.chain().setTextSelection(4).updateAttributes('taskItem', { checked: true }).run()

    // Verify the custom attribute is still present after update
    const updatedTaskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(updatedTaskItemElement).not.toBeNull()
    expect(updatedTaskItemElement?.getAttribute('data-uid')).toBe('test-uid-123')
    expect(updatedTaskItemElement?.getAttribute('data-checked')).toBe('true')
  })

  it('removes attributes when set to null', () => {
    const CustomTaskItem = TaskItem.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          uid: {
            default: null,
            parseHTML: element => element.getAttribute('data-uid'),
            renderHTML: attributes => {
              if (!attributes.uid) {
                return {}
              }
              return { 'data-uid': attributes.uid }
            },
          },
        }
      },
    })

    editor = new Editor({
      extensions: [Document, Paragraph, Text, TaskList, CustomTaskItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false, uid: 'test-uid-456' },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test task' }] }],
              },
            ],
          },
        ],
      },
    })

    // Verify the initial attribute is present
    const taskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(taskItemElement?.getAttribute('data-uid')).toBe('test-uid-456')

    // Remove the uid attribute
    editor.chain().setTextSelection(4).updateAttributes('taskItem', { uid: null }).run()

    // Verify the attribute is removed (empty string or not present depends on renderHTML returning {})
    const updatedTaskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(updatedTaskItemElement?.getAttribute('data-uid')).toBeNull()
  })

  it('updates multiple custom attributes simultaneously', () => {
    const CustomTaskItem = TaskItem.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          uid: {
            default: null,
            parseHTML: element => element.getAttribute('data-uid'),
            renderHTML: attributes => {
              if (!attributes.uid) {
                return {}
              }
              return { 'data-uid': attributes.uid }
            },
          },
          priority: {
            default: null,
            parseHTML: element => element.getAttribute('data-priority'),
            renderHTML: attributes => {
              if (!attributes.priority) {
                return {}
              }
              return { 'data-priority': attributes.priority }
            },
          },
        }
      },
    })

    editor = new Editor({
      extensions: [Document, Paragraph, Text, TaskList, CustomTaskItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false, uid: 'task-1', priority: 'high' },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test task' }] }],
              },
            ],
          },
        ],
      },
    })

    const taskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(taskItemElement?.getAttribute('data-uid')).toBe('task-1')
    expect(taskItemElement?.getAttribute('data-priority')).toBe('high')

    // Update all attributes
    editor
      .chain()
      .setTextSelection(4)
      .updateAttributes('taskItem', {
        checked: true,
        uid: 'task-updated',
        priority: 'low',
      })
      .run()

    const updatedTaskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(updatedTaskItemElement?.getAttribute('data-checked')).toBe('true')
    expect(updatedTaskItemElement?.getAttribute('data-uid')).toBe('task-updated')
    expect(updatedTaskItemElement?.getAttribute('data-priority')).toBe('low')
  })

  it('preserves HTMLAttributes from configure() options during updates', () => {
    // Configure TaskItem with static HTMLAttributes
    const ConfiguredTaskItem = TaskItem.configure({
      HTMLAttributes: {
        class: 'custom-task-item',
        'data-static': 'static-value',
      },
    })

    editor = new Editor({
      extensions: [Document, Paragraph, Text, TaskList, ConfiguredTaskItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test task' }] }],
              },
            ],
          },
        ],
      },
    })

    // Verify the static attributes are present initially
    const taskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(taskItemElement?.getAttribute('class')).toBe('custom-task-item')
    expect(taskItemElement?.getAttribute('data-static')).toBe('static-value')
    expect(taskItemElement?.getAttribute('data-checked')).toBe('false')

    // Update the task item
    editor.chain().setTextSelection(4).updateAttributes('taskItem', { checked: true }).run()

    // Verify static attributes are still present after update
    const updatedTaskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(updatedTaskItemElement?.getAttribute('class')).toBe('custom-task-item')
    expect(updatedTaskItemElement?.getAttribute('data-static')).toBe('static-value')
    expect(updatedTaskItemElement?.getAttribute('data-checked')).toBe('true')
  })

  it('restores static HTMLAttributes when dynamic attribute with same key is removed', () => {
    // Configure TaskItem with a static attribute that will be overridden by dynamic attribute
    const ConfiguredTaskItem = TaskItem.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          customClass: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.customClass) {
                return {}
              }
              return { class: attributes.customClass }
            },
          },
        }
      },
    }).configure({
      HTMLAttributes: {
        class: 'static-class',
      },
    })

    editor = new Editor({
      extensions: [Document, Paragraph, Text, TaskList, ConfiguredTaskItem],
      content: {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false, customClass: 'dynamic-class' },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test task' }] }],
              },
            ],
          },
        ],
      },
    })

    // Dynamic class should override static class initially
    const taskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(taskItemElement?.getAttribute('class')).toBe('dynamic-class')

    // Remove the dynamic class attribute
    editor.chain().setTextSelection(4).updateAttributes('taskItem', { customClass: null }).run()

    // Static class should be restored
    const updatedTaskItemElement = editor.view.dom.querySelector('li[data-checked]')

    expect(updatedTaskItemElement?.getAttribute('class')).toBe('static-class')
  })

  it('toggles off an ordered list when the whole document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()
    expect(editor.state.selection.from).toBe(0)
    expect(editor.state.selection.to).toBe(editor.state.doc.content.size)
    editor.commands.toggleOrderedList()

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test item' }],
        },
      ],
    })
  })

  it('toggles off a bullet list when the whole document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()
    expect(editor.state.selection.from).toBe(0)
    expect(editor.state.selection.to).toBe(editor.state.doc.content.size)
    editor.commands.toggleBulletList()

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test item' }],
        },
      ],
    })
  })

  it('converts a bullet list to an ordered list when the whole document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()
    expect(editor.state.selection.from).toBe(0)
    expect(editor.state.selection.to).toBe(editor.state.doc.content.size)
    editor.commands.toggleOrderedList()

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: {
            start: 1,
            type: null,
          },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Test item' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })
  it('reports ordered list toggle as available when the whole ordered list document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            attrs: {
              start: 1,
              type: null,
            },
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()

    expect(editor.can().toggleOrderedList()).toBe(true)
  })
  it('reports bullet list toggle as available when the whole bullet list document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()

    expect(editor.can().toggleBulletList()).toBe(true)
  })
  it('reports ordered list toggle as available when the whole bullet list document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()

    expect(editor.can().toggleOrderedList()).toBe(true)
  })

  it('reports bullet list toggle as available when the whole ordered list document is selected', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()

    expect(editor.can().toggleBulletList()).toBe(true)
  })

  it('preserves text selection after toggling off an ordered list with AllSelection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()
    expect(editor.state.selection.from).toBe(0)
    expect(editor.state.selection.to).toBe(editor.state.doc.content.size)

    editor.commands.toggleOrderedList()

    const { from, to } = editor.state.selection

    expect(from).toBe(1)
    expect(to).toBe(10)
  })

  it('preserves text selection after toggling off a bullet list with AllSelection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test item' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()
    expect(editor.state.selection.from).toBe(0)
    expect(editor.state.selection.to).toBe(editor.state.doc.content.size)

    editor.commands.toggleBulletList()

    const { from, to } = editor.state.selection

    expect(from).toBe(1)
    expect(to).toBe(10)
  })

  it('preserves text selection after toggling off a multi-item ordered list with AllSelection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ListItem, OrderedList, BulletList],
      content: {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'First' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Second' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    editor.commands.selectAll()
    expect(editor.state.selection.from).toBe(0)
    expect(editor.state.selection.to).toBe(editor.state.doc.content.size)

    editor.commands.toggleOrderedList()

    const { from, to } = editor.state.selection

    expect(from).toBe(1)
    expect(to).toBe(14)
  })
})
