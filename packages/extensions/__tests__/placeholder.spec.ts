import { Editor } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import { type PlaceholderOptions, Placeholder, preparePlaceholderAttribute } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

describe('extension-placeholder', () => {
  let editor: Editor | null = null

  const createEditor = (placeholderOptions: Partial<PlaceholderOptions>) => {
    if (editor) {
      editor.destroy()
      editor = null
    }

    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(placeholderOptions)],
      content: '<p></p>',
    })
  }

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  it('uses the default data-placeholder attribute when not passing any dataAttribute option', () => {
    createEditor({
      placeholder: 'Type something...',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('falls back to the default when passing in an empty string', () => {
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: '',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('uses a custom data-placeholder attribute when passing a dataAttribute option', () => {
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: 'my-placeholder',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('auto-replaces spaces with dashes to keep a valid html element', () => {
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: 'my placeholder',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('auto-repairs an invalid attribute string', () => {
    const brokenAttr = '5 My br0ken $tring'
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: brokenAttr,
    })

    const attributeName = preparePlaceholderAttribute(brokenAttr)
    expect(attributeName).toBe('my-br0ken-tring')

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-br0ken-tring')).toBe('Type something...')

    editor!.destroy()
  })
})
describe('extension-placeholder with excludedNodeTypes', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  it('should not show placeholder on excluded node types', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        ListItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: true,
          excludedNodeTypes: ['bulletList', 'listItem'],
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // bulletList should NOT have placeholder (excluded)
    expect(bulletList.hasAttribute('data-placeholder')).toBe(false)
    // listItem should NOT have placeholder (excluded)
    expect(listItem.hasAttribute('data-placeholder')).toBe(false)
    // paragraph should have placeholder (empty)
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should show placeholder on empty nodes when excludedNodeTypes is empty', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        ListItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: true,
          excludedNodeTypes: [],
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // All nodes with empty content will have placeholder when not excluded
    // bulletList contains an empty listItem, so it is also considered empty
    expect(bulletList.hasAttribute('data-placeholder')).toBe(true)
    // listItem has an empty paragraph, so isNodeEmpty returns true
    expect(listItem.hasAttribute('data-placeholder')).toBe(true)
    // paragraph is empty
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should support excluding multiple node types', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TaskList,
        TaskItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: true,
          excludedNodeTypes: ['taskList', 'taskItem', 'orderedList', 'bulletList'],
        }),
      ],
      content: '<ul data-type="taskList"><li data-type="taskItem"><p></p></li></ul>',
    })

    const taskList = editor!.view.dom.querySelector('ul') as HTMLElement
    const taskItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // taskList should NOT have placeholder (excluded)
    expect(taskList.hasAttribute('data-placeholder')).toBe(false)
    // taskItem should NOT have placeholder (excluded)
    expect(taskItem.hasAttribute('data-placeholder')).toBe(false)
    // paragraph should have placeholder (empty)
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should not traverse children when includeChildren is false and node is excluded', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        ListItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: false,
          excludedNodeTypes: ['bulletList'],
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement

    // bulletList should NOT have placeholder (excluded)
    expect(bulletList.hasAttribute('data-placeholder')).toBe(false)
    // listItem should NOT have placeholder (includeChildren is false, so children are not traversed)
    expect(listItem.hasAttribute('data-placeholder')).toBe(false)
  })
})
