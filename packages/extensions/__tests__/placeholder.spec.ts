import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
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
