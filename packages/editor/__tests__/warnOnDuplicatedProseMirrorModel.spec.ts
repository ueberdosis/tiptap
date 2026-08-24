import { Editor } from '@tiptap/editor'
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
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
