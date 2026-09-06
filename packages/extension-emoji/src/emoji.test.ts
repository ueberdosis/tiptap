import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { gitHubEmojis } from './data.js'
import { Emoji, inputRegex, pasteRegex } from './emoji.js'

describe('emoji extension', () => {
  it('inputRegex matches typical shortcode', () => {
    expect(':smile:').toMatch(inputRegex)
  })

  it('pasteRegex matches standalone shortcode', () => {
    expect(':smile:').toMatch(pasteRegex)
  })

  it('pasteRegex does NOT match shortcode inside url-like text', () => {
    // This should NOT match because the shortcode is part of a URL path
    expect('https://example.com/:x:/sub/').not.toMatch(pasteRegex)
  })

  it('pasteRegex matches when preceded by space', () => {
    expect(' test :smile: ').toMatch(pasteRegex)
  })
})

describe('Emoji.setEmoji command', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit, Emoji.configure({ emojis: gitHubEmojis, enableEmoticons: true })],
      content: '<p></p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('inserts an emoji node by name', () => {
    editor.commands.setEmoji('zap')
    const emoji = editor.view.dom.querySelector('[data-type="emoji"][data-name="zap"]')
    expect(emoji).not.toBeNull()
  })

  it('renders the emoji as an inline node in the document', () => {
    editor.commands.setEmoji('smile')
    expect(editor.getHTML()).toContain('data-type="emoji"')
    expect(editor.getHTML()).toContain('data-name="smile"')
  })
})
