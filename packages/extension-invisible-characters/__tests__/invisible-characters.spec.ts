import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import InvisibleCharacters from '@tiptap/extension-invisible-characters'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('InvisibleCharacters', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Heading, Text, InvisibleCharacters, HardBreak],
      content:
        '<h1>This is a heading.</h1><p>This<br>is<br>a<br>paragraph.</p><p>Another paragraph.</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('renders invisible character decorations when shown', () => {
    editor.commands.showInvisibleCharacters()
    const decorations = editor.view.dom.querySelectorAll('[class*="tiptap-invisible-character"]')
    expect(decorations.length).toBeGreaterThan(0)
  })
})
