import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Markdown } from '@tiptap/markdown'
import { useEditor, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const markdown = `# Markdown parsing demo

This document demonstrates which Markdown constructs are parsed and preserved when using the @tiptap/markdown extension together with the editor's registered extensions.

## Headings

### H3 example

Headings (H1, H2, H3...) are preserved when ${'`'}StarterKit${'`'} is enabled.

## Lists

- Unordered list item A
- Unordered list item B
  - Nested item B.1

1. Ordered item 1
2. Ordered item 2

## Code

Inline code works: ${'`'}const x = 1${'`'}

Code block example:

${'```'}js
function greet(name) {
  return ${'`'}Hello, ${'${'}name${'}'}!${'`'}
}
${'```'}

## Table

| Name | Feature |
| ---- | ------- |
| A    | Headings |
| B    | Lists |

## Image (example)

![Alt text](https://unsplash.it/800/500)

## Notes

- The demo calls ${'`'}editor.commands.setContent(markdownText, { contentType: 'markdown' })${'`'} to parse Markdown.
- Supported constructs are preserved only if a matching extension is registered (e.g., tables require ${'`'}TableKit${'`'}, images require ${'`'}Image${'`'}).
- Unsupported constructs will be dropped/stripped from the resulting editor document.

Feel free to click "Parse Markdown" or upload a \`.md\` file to test parsing with your editor configuration.
`

export default () => {
  const editor = useEditor({
    extensions: [Markdown, StarterKit, Image, TableKit],
    content: `
      <p>In this demo you can parse Markdown content into Tiptap on the client-side via <code>@tiptap/markdown</code>.</p>
      <p>Click the button above or use your own markdown file to test it out.</p>
    `,
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button onClick={() => editor.commands.setContent(markdown, { contentType: 'markdown' })}>
            Parse Markdown
          </button>
          <input
            type="file"
            id="upload"
            style={{ display: 'none' }}
            fileaccept=".md,.markdown,text/markdown,text/md"
            onChange={event => {
              const file = event.target.files?.[0]

              if (file) {
                const reader = new FileReader()

                reader.onload = e => {
                  const text = e.target?.result

                  if (typeof text === 'string') {
                    editor.commands.setContent(text, { contentType: 'markdown' })
                  }
                }

                reader.readAsText(file)
              }
            }}
          />
          <button onClick={() => document.getElementById('upload')?.click()}>Select Markdown File</button>
        </div>
      </div>
      <Tiptap instance={editor}>
        <Tiptap.Content />
      </Tiptap>
    </>
  )
}
