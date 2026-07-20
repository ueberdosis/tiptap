import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import InvisibleCharacters, {
  HardBreakNode,
  NonBreakingSpaceCharacter,
  ParagraphNode,
  SpaceCharacter,
  TabCharacter,
} from '@tiptap/extension-invisible-characters'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

const createEditor = (options: Partial<ConstructorParameters<typeof Editor>[0]> = {}) => {
  const element = document.createElement('div')
  document.body.appendChild(element)

  return new Editor({
    element,
    extensions: [Document, Paragraph, Heading, Text, InvisibleCharacters, HardBreak],
    ...options,
  })
}

const countDecorations = (editor: Editor, type: string) => {
  return editor.view.dom.querySelectorAll(`.tiptap-invisible-character--${type}`).length
}

describe('InvisibleCharacters', () => {
  let editor: Editor

  afterEach(() => {
    editor.destroy()
  })

  it('renders invisible character decorations when shown', () => {
    editor = createEditor({
      content:
        '<h1>This is a heading.</h1><p>This<br>is<br>a<br>paragraph.</p><p>Another paragraph.</p>',
    })
    editor.commands.showInvisibleCharacters()
    const decorations = editor.view.dom.querySelectorAll('[class*="tiptap-invisible-character"]')
    expect(decorations.length).toBeGreaterThan(0)
  })

  describe('default builders', () => {
    it('does not decorate tabs or non-breaking spaces', () => {
      editor = createEditor()
      editor.commands.insertContent({ type: 'text', text: 'a\tb\u00a0c' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(0)
      expect(countDecorations(editor, 'non-breaking-space')).toBe(0)
    })

    it('does not decorate a non-breaking space as a regular space', () => {
      editor = createEditor()
      editor.commands.insertContent({ type: 'text', text: 'a\u00a0b' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'space')).toBe(0)
    })
  })

  describe('opt-in tab and non-breaking space builders', () => {
    const createOptInEditor = (options: Partial<ConstructorParameters<typeof Editor>[0]> = {}) => {
      return createEditor({
        extensions: [
          Document,
          Paragraph,
          Heading,
          Text,
          HardBreak,
          InvisibleCharacters.configure({
            builders: [
              new SpaceCharacter(),
              new ParagraphNode(),
              new HardBreakNode(),
              new TabCharacter(),
              new NonBreakingSpaceCharacter(),
            ],
          }),
        ],
        ...options,
      })
    }

    it('decorates tab characters', () => {
      editor = createOptInEditor()
      editor.commands.insertContent({ type: 'text', text: 'a\tb' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(1)
    })

    it('decorates non-breaking spaces', () => {
      editor = createOptInEditor({ content: '<p>a&nbsp;b</p>' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'non-breaking-space')).toBe(1)
    })

    it('decorates each character with its own type', () => {
      editor = createOptInEditor()
      editor.commands.insertContent({ type: 'text', text: 'a b\u00a0c\td' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'space')).toBe(1)
      expect(countDecorations(editor, 'non-breaking-space')).toBe(1)
      expect(countDecorations(editor, 'tab')).toBe(1)
    })

    it('decorates consecutive tabs and non-breaking spaces', () => {
      editor = createOptInEditor()
      editor.commands.insertContent({ type: 'text', text: 'a\t\t\u00a0\u00a0\u00a0b' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(2)
      expect(countDecorations(editor, 'non-breaking-space')).toBe(3)
    })

    it('decorates tabs inside headings', () => {
      editor = createOptInEditor({ content: '<h1>heading</h1>' })
      editor.commands.showInvisibleCharacters()
      editor.commands.insertContentAt(2, { type: 'text', text: '\t' })

      expect(countDecorations(editor, 'tab')).toBe(1)
    })

    it('updates decorations when content changes', () => {
      editor = createOptInEditor({ content: '<p>ab</p>' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(0)

      editor.commands.insertContentAt(2, { type: 'text', text: '\t' })
      expect(countDecorations(editor, 'tab')).toBe(1)

      editor.commands.deleteRange({ from: 2, to: 3 })
      expect(countDecorations(editor, 'tab')).toBe(0)
    })

    it('decorates a tab inserted as a plain string', () => {
      editor = createOptInEditor({ content: '<p>ab</p>' })
      editor.commands.showInvisibleCharacters()
      editor.commands.setTextSelection(2)
      editor.chain().focus().insertContent('\t').run()

      expect(countDecorations(editor, 'tab')).toBe(1)
    })

    it('does not duplicate decorations for multi-step transactions', () => {
      editor = createOptInEditor({ content: '<p>abcdef</p>' })
      editor.commands.showInvisibleCharacters()

      editor.view.dispatch(editor.state.tr.insertText('\t', 5).insertText('\t', 6))

      expect(countDecorations(editor, 'tab')).toBe(2)
    })

    it('removes decorations again on undo', () => {
      editor = createOptInEditor({
        content: '<p>ab</p>',
        extensions: [
          Document,
          Paragraph,
          Text,
          UndoRedo,
          InvisibleCharacters.configure({
            builders: [new TabCharacter(), new NonBreakingSpaceCharacter()],
          }),
        ],
      })
      editor.commands.showInvisibleCharacters()

      editor.commands.insertContentAt(2, { type: 'text', text: '\t' })
      expect(countDecorations(editor, 'tab')).toBe(1)

      editor.commands.undo()
      expect(countDecorations(editor, 'tab')).toBe(0)

      editor.commands.redo()
      expect(countDecorations(editor, 'tab')).toBe(1)
    })

    it('decorates a tab directly before the end of a paragraph', () => {
      editor = createOptInEditor()
      editor.commands.insertContent({ type: 'text', text: 'ab\t' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(1)
      expect(countDecorations(editor, 'paragraph')).toBe(1)
    })

    it('hides decorations when invisible characters are hidden', () => {
      editor = createOptInEditor()
      editor.commands.insertContent({ type: 'text', text: 'a\tb\u00a0c' })
      editor.commands.showInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(1)
      expect(countDecorations(editor, 'non-breaking-space')).toBe(1)

      editor.commands.hideInvisibleCharacters()

      expect(countDecorations(editor, 'tab')).toBe(0)
      expect(countDecorations(editor, 'non-breaking-space')).toBe(0)
    })
  })
})
