// Registers the DOM cleanup hooks for this file, so the rest of the suite does
// not need the Svelte testing setup.
import '@testing-library/svelte/vitest'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import { Editor } from '../../Editor.js'
import EditorContent from '../EditorContent.svelte'

const createEditor = (element: HTMLElement | null) =>
  new Editor({ element, extensions: [Document, Paragraph, Text], content: '<p>hello</p>' })

describe('EditorContent', () => {
  it('moves the editor DOM into its own element', () => {
    const editor = createEditor(document.createElement('div'))

    const { container } = render(EditorContent, { editor })

    expect(container.querySelector('.tiptap')?.textContent).toBe('hello')

    editor.destroy()
  })

  it('does not throw for an unmounted editor', () => {
    const editor = createEditor(null)

    expect(() => render(EditorContent, { editor })).not.toThrow()
  })

  it('does not throw for a destroyed editor', () => {
    const editor = createEditor(document.createElement('div'))
    editor.destroy()

    expect(() => render(EditorContent, { editor })).not.toThrow()
  })
})
