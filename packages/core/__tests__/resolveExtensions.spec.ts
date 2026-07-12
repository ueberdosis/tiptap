import { Extension, resolveExtensions } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { Dropcursor } from '@tiptap/extensions'
import { describe, expect, it, vi } from 'vitest'

describe('resolveExtensions', () => {
  it('deduplicates extensions by name and keeps the last defined extension', () => {
    const customDropcursor = Dropcursor.configure({ color: 'red' })

    const resolved = resolveExtensions([StarterKit, customDropcursor])
    const dropcursorExtensions = resolved.filter(extension => extension.name === 'dropCursor')

    expect(dropcursorExtensions).toHaveLength(1)
    expect(dropcursorExtensions[0].options.color).toBe('red')
  })

  it('does not warn when duplicate extension names are resolved by deduplication', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    resolveExtensions([StarterKit, Dropcursor])

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
  })

  it('does not warn when multiple editors use dropcursor independently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const extensions = [Document, Paragraph, Text, Dropcursor]

    resolveExtensions(extensions)
    resolveExtensions(extensions)

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
  })

  it('deduplicates custom extensions with the same name', () => {
    const first = Extension.create({ name: 'custom' })
    const second = Extension.create({ name: 'custom' }).configure({ foo: 'bar' } as never)

    const resolved = resolveExtensions([first, second])
    const customExtensions = resolved.filter(extension => extension.name === 'custom')

    expect(customExtensions).toHaveLength(1)
    expect(customExtensions[0]).toBe(second)
  })
})
