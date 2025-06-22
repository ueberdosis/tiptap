import { expect, test } from '@playwright/test'

import { getEditorHTML, runEditor } from '../../../helpers.js'

test.describe('React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/src/Commands/SetContent/React/')
    await page.waitForSelector('.tiptap')
  })

  test('should insert raw text content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('Hello World.')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>Hello World.</p>')
  })

  test('should insert raw JSON content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent({ type: 'paragraph', content: [{ type: 'text', text: 'Hello World.' }] })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>Hello World.</p>')
  })

  test('should insert a Prosemirror Node as content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent(editor.schema.node('paragraph', null, editor.schema.text('Hello World.')).content)
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>Hello World.</p>')
  })

  test('should insert a Prosemirror Fragment as content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent(
        editor.schema.node('doc', null, editor.schema.node('paragraph', null, editor.schema.text('Hello World.')))
          .content,
      )
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>Hello World.</p>')
  })

  test('should emit updates', async ({ page }) => {
    let updateCount = 0

    await page.exposeFunction('notifyUpdate', () => {
      updateCount += 1
    })

    await runEditor(page, editor => {
      editor.on('update', () => {
        // @ts-ignore
        window.notifyUpdate()
      })

      editor.commands.setContent('Hello World.')
    })

    await test.expect(updateCount).toBe(1)

    await runEditor(page, editor => {
      editor.commands.setContent('Hello World again.')
    })

    await test.expect(updateCount).toBe(2)

    // lets reset to test if we can set content without emitting updates
    updateCount = 0

    await runEditor(page, editor => {
      editor.commands.setContent('Hello World again.', { emitUpdate: false })
    })

    await test.expect(updateCount).toBe(0)
  })

  test('should insert more complex html content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent(
        '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
      )
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain(
      '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
    )
  })

  test('should remove newlines and tabs', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>Hello world how nice.</p>')
  })

  test('should keep newlines and tabs when preserveWhitespace = full', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>', {
        parseOptions: { preserveWhitespace: 'full' },
      })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
  })

  test('should overwrite existing content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<p>Initial content</p>')
    })

    let html = await getEditorHTML(page)
    await expect(html).toContain('<p>Initial content</p>')

    await runEditor(page, editor => {
      editor.commands.setContent('<p>Overwritten Content</p>')
    })

    html = await getEditorHTML(page)
    await expect(html).toContain('<p>Overwritten Content</p>')

    await runEditor(page, editor => {
      editor.commands.setContent('Content without tags')
    })
    html = await getEditorHTML(page)

    await expect(html).toContain('<p>Content without tags</p>')
  })

  test('should insert mentions', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain(
      '<span data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span>',
    )
  })

  test('should remove newlines and tabs between html fragments', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  // TODO: I'm not certain about this behavior and what it should do...
  // This exists in insertContentAt as well
  test('should keep newlines and tabs between html fragments when preserveWhitespace = full', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>', {
        parseOptions: {
          preserveWhitespace: 'full',
        },
      })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<h1>Tiptap</h1><p>\n\t</p><p><strong>Hello World</strong></p>')
  })

  test('should allow inserting nothing', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('')
  })

  test('should allow inserting nothing when preserveWhitespace = full', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('', { parseOptions: { preserveWhitespace: 'full' } })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('')
  })

  test('should allow inserting a partial HTML tag', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<p>foo')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>foo</p>')
  })

  test('should allow inserting a partial HTML tag when preserveWhitespace = full', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<p>foo', { parseOptions: { preserveWhitespace: 'full' } })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>foo</p>')
  })

  test('will remove an incomplete HTML tag', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('foo<p')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>foo</p>')
  })

  // TODO: I'm not certain about this behavior and what it should do...
  // This exists in insertContentAt as well
  test('should allow inserting an incomplete HTML tag when preserveWhitespace = full', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('foo<p', { parseOptions: { preserveWhitespace: 'full' } })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<p>foo&lt;p</p>')
  })

  test('should allow inserting a list', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>')
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
  })

  test('should allow inserting a list when preserveWhitespace = full', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>', { parseOptions: { preserveWhitespace: 'full' } })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
  })

  test('should remove newlines and tabs when parseOptions.preserveWhitespace=false', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
        parseOptions: {
          preserveWhitespace: false,
        },
      })
    })

    const html = await getEditorHTML(page)
    await expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })
})
