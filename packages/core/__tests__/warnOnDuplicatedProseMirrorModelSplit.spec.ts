import { createRequire } from 'node:module'

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

// Put @tiptap/core on the CJS build and the rest of ProseMirror on the ESM one.
// Own file because the warning fires once per process.
vi.mock('@tiptap/pm/model', () => {
  const require = createRequire(import.meta.url)

  return { ...require('prosemirror-model') }
})

describe('warnOnDuplicatedProseMirrorModel with a duplicated copy', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    vi.restoreAllMocks()
  })

  it('warns once, not for every editor', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const extensions = [Document, Paragraph, Text]

    editor = new Editor({ extensions, content: '<p>hello</p>' })
    const second = new Editor({ extensions, content: '<p>hello</p>' })

    second.destroy()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('prosemirror-model is loaded more than once')
  })
})
