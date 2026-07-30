import { Editor } from '@tiptap/core'
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
