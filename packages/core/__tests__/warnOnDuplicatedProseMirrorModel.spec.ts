import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

describe('warnOnDuplicatedProseMirrorModel', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    vi.restoreAllMocks()
  })

  it('stays quiet when prosemirror-model is loaded once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor = new Editor({ extensions: [Document, Paragraph, Text], content: '<p>hello</p>' })

    expect(warn).not.toHaveBeenCalled()
  })
})
