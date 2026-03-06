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
describe('extension-placeholder with includeChildren and wrapper nodes', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  it('should not show placeholder on non-textblock wrapper nodes (bulletList, listItem)', () => {
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
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // bulletList is not a textblock, so it should NOT have a placeholder
    expect(bulletList.hasAttribute('data-placeholder')).toBe(false)
    // listItem is not a textblock, so it should NOT have a placeholder
    expect(listItem.hasAttribute('data-placeholder')).toBe(false)
    // paragraph is a textblock, so it should have a placeholder
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should not show placeholder on non-textblock nodes for taskList structures', () => {
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
        }),
      ],
      content: '<ul data-type="taskList"><li data-type="taskItem"><p></p></li></ul>',
    })

    const taskList = editor!.view.dom.querySelector('ul') as HTMLElement
    const taskItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // taskList is not a textblock, so it should NOT have a placeholder
    expect(taskList.hasAttribute('data-placeholder')).toBe(false)
    // taskItem is not a textblock, so it should NOT have a placeholder
    expect(taskItem.hasAttribute('data-placeholder')).toBe(false)
    // paragraph is a textblock, so it should have a placeholder
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should not show placeholder on non-textblock nodes and not traverse their children when includeChildren is false', () => {
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
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // bulletList is not a textblock, so it should NOT have a placeholder
    // (with the old implementation, bulletList was considered empty and would receive a placeholder)
    expect(bulletList.hasAttribute('data-placeholder')).toBe(false)
    // listItem and paragraph are not traversed because includeChildren is false
    expect(listItem.hasAttribute('data-placeholder')).toBe(false)
    expect(paragraph.hasAttribute('data-placeholder')).toBe(false)
  })
})
