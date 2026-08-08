import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

const createEditor = () =>
  new Editor({
    element: null,
    extensions: [Document, Paragraph, Text],
    content: '<p>Hello</p>',
  })

describe('post-destroy access', () => {
  it('does not throw when commands is accessed after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(() => editor.commands).not.toThrow()
  })

  it('returns false when invoking a command after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(editor.commands.setContent('<p>x</p>')).toBe(false)
  })

  it('does not throw when chain() is accessed after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(() => editor.chain()).not.toThrow()
  })

  it('returns false from chain().run() after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(editor.chain().setContent('<p>x</p>').run()).toBe(false)
  })

  it('does not throw when can() is accessed after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(() => editor.can()).not.toThrow()
  })

  it('does not throw when can().chain() is chained after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(() => editor.can().chain().toggleBold()).not.toThrow()
  })

  it('returns false from can().chain().<cmd>().run() after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(editor.can().chain().toggleBold().run()).toBe(false)
  })

  it('does not expose a callable `then` on the no-op proxies after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect((editor.commands as any).then).toBeUndefined()
    expect((editor.chain() as any).then).toBeUndefined()
    expect((editor.can() as any).then).toBeUndefined()
    expect((editor.can().chain() as any).then).toBeUndefined()
  })

  it('settles when awaiting the no-op proxies after destroy', async () => {
    const editor = createEditor()
    editor.destroy()
    await expect(Promise.resolve(editor.commands)).resolves.toBeDefined()
    await expect(Promise.resolve(editor.chain())).resolves.toBeDefined()
    await expect(Promise.resolve(editor.can())).resolves.toBeDefined()
  })

  it('returns "" from getHTML() after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(editor.getHTML()).toBe('')
  })

  it('returns "" from getText() after destroy', () => {
    const editor = createEditor()
    editor.destroy()
    expect(editor.getText()).toBe('')
  })
})
