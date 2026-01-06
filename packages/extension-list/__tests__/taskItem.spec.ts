import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { TaskItem, TaskList } from '../src/index.js'

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
})
