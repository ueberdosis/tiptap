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
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({ limit, autoTrim }),
      ],
      content,
    })
    return editor
  }

  describe('autoTrim', () => {
    it('trims from the END when initial content exceeds the limit', () => {
      // Content is "Hello World" (11 chars), limit is 5.
      // Expected: first 5 characters preserved → "Hello"
      // Bug: previous code deleted from the beginning → "World" (wrong)
      createEditor('<p>Hello World</p>', 5)
      expect(editor!.getText()).toBe('Hello')
    })

    it('does not modify content that is within the limit', () => {
      createEditor('<p>Hi</p>', 10)
      expect(editor!.getText()).toBe('Hi')
    })

    it('trims correctly when the document has exactly the limit characters', () => {
      createEditor('<p>Hello</p>', 5)
      expect(editor!.getText()).toBe('Hello')
    })

    it('preserves an empty document', () => {
      createEditor('<p></p>', 5)
      expect(editor!.getText()).toBe('')
    })

    it('does not trim when autoTrim is false', () => {
      // When autoTrim is false the content should be left untouched even if over limit.
      createEditor('<p>Hello World</p>', 5, false)
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
