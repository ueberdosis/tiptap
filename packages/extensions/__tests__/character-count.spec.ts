import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { CharacterCount } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

describe('extension-character-count', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  const createEditor = (content: string, limit: number, autoTrim = true) => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, CharacterCount.configure({ limit, autoTrim })],
      content,
    })
    return editor
  }

  // The `create` lifecycle event (and therefore CharacterCount's onCreate,
  // which performs the initial autoTrim) is emitted via `window.setTimeout(...,
  // 0)` inside Editor#mount — it is not synchronous with the constructor.
  // Tests that assert on initial-content autoTrim must flush that tick first.
  const flushCreate = () => new Promise(resolve => setTimeout(resolve, 0))

  describe('autoTrim', () => {
    it('trims from the END when initial content exceeds the limit', async () => {
      // Content is "Hello World" (11 chars), limit is 5.
      // Expected: first 5 characters preserved → "Hello"
      // Bug: previous code deleted from the beginning → "World" (wrong)
      createEditor('<p>Hello World</p>', 5)
      await flushCreate()
      expect(editor!.getText()).toBe('Hello')
    })

    it('does not modify content that is within the limit', async () => {
      createEditor('<p>Hi</p>', 10)
      await flushCreate()
      expect(editor!.getText()).toBe('Hi')
    })

    it('trims correctly when the document has exactly the limit characters', async () => {
      createEditor('<p>Hello</p>', 5)
      await flushCreate()
      expect(editor!.getText()).toBe('Hello')
    })

    it('preserves an empty document', async () => {
      createEditor('<p></p>', 5)
      await flushCreate()
      expect(editor!.getText()).toBe('')
    })

    it('does not trim when autoTrim is false', async () => {
      // When autoTrim is false the content should be left untouched even if over limit.
      createEditor('<p>Hello World</p>', 5, false)
      await flushCreate()
      expect(editor!.getText()).toBe('Hello World')
    })
  })

  describe('character count', () => {
    it('counts characters correctly', () => {
      createEditor('<p>Hello</p>', 100)
      expect(editor!.storage.characterCount.characters()).toBe(5)
    })

    it('counts words correctly', () => {
      createEditor('<p>Hello World</p>', 100)
      expect(editor!.storage.characterCount.words()).toBe(2)
    })
  })
})
