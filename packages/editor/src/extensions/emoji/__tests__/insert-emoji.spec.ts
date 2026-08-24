import { Editor } from '@tiptap/editor'
import { Emoji } from '@tiptap/editor/extensions/emoji'
import { gitHubEmojis } from '@tiptap/editor/extensions/emoji/data'
import { StarterKit } from '@tiptap/editor/kits/starter'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

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
