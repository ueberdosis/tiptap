import { Editor } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'

describe('Markdown serialization – overlapping marks', () => {
  it('serializes overlapping bold and italic without crossing marks', () => {
    const editor = new Editor({
      extensions: [StarterKit, Markdown],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '123',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: '456',
                marks: [{ type: 'bold' }, { type: 'italic' }],
              },
              {
                type: 'text',
                text: '789',
                marks: [{ type: 'italic' }],
              },
            ],
          },
        ],
      },
    })

    const markdown = editor.storage.markdown.getMarkdown()

    expect(markdown).toContain('123')
    expect(markdown).toContain('456')
    expect(markdown).toContain('789')

    // Ensure marks are not crossing
    expect(markdown).not.toBe('**123*456**789*')
  })
})
