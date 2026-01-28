import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder, preparePlaceholderAttribute } from '@tiptap/extensions'
import { describe, expect, it } from 'vitest'

describe('extension-placeholder', () => {
  it('uses the default data-placeholder attribute when not passing any dataAttribute option', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')
  })

  it('uses a custom data-placeholder attribute when passing a dataAttribute option', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          dataAttribute: 'my-placeholder',
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-placeholder')).toBe('Type something...')
  })

  it('auto-replaces spaces with dashes to keep a valid html element', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          dataAttribute: 'my placeholder',
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-placeholder')).toBe('Type something...')
  })

  it('auto-repairs an invalid attribute string', () => {
    const brokenAttr = '5 My br0ken $tring'
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          dataAttribute: brokenAttr,
        }),
      ],
      content: '<p></p>',
    })

    const attributeName = preparePlaceholderAttribute(brokenAttr)
    expect(attributeName).toBe('my-br0ken-tring')

    const paragraph = editor.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-br0ken-tring')).toBe('Type something...')
  })
})
