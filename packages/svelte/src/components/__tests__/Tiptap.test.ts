// Registers the DOM cleanup hooks for this file, so the rest of the suite does
// not need the Svelte testing setup.
import '@testing-library/svelte/vitest'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import { Editor } from '../../Editor.js'
import TiptapHost from './fixtures/TiptapHost.svelte'

const createEditor = (content: string) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [Document, Paragraph, Text],
    content,
  })

const editorTexts = (container: HTMLElement) =>
  [...container.querySelectorAll('.tiptap')].map(element => element.textContent)

describe('Tiptap', () => {
  it('renders the editor from context', () => {
    const editor = createEditor('<p>first</p>')

    const { container } = render(TiptapHost, { editor })

    expect(editorTexts(container)).toEqual(['first'])

    editor.destroy()
  })

  it('renders the replacement editor when the prop changes', async () => {
    const first = createEditor('<p>first</p>')
    const second = createEditor('<p>second</p>')

    const { container, rerender } = render(TiptapHost, { editor: first })

    await rerender({ editor: second })

    expect(editorTexts(container)).toEqual(['second'])

    first.destroy()
    second.destroy()
  })
})
