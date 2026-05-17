import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Commands/SetContent/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Commands/SetContent/React/')
  })

  test.beforeEach(async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
  })

  test('should insert raw text content', async ({ page }) => {
    await setEditorContent(page, 'Hello World.')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Hello World.</p>')
  })

  test('should insert raw JSON content', async ({ page }) => {
    await setEditorContent(page, { type: 'paragraph', content: [{ type: 'text', text: 'Hello World.' }] })
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Hello World.</p>')
  })

  test('should insert a Prosemirror Node as content', async ({ page }) => {
    await setEditorContent(
      page,
      await editorEval(page, `editor.schema.node('paragraph', null, editor.schema.text('Hello World.'))`),
    )
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Hello World.</p>')
  })

  test('should insert a Prosemirror Fragment as content', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setContent(
        editor.schema.node('doc', null, editor.schema.node('paragraph', null, editor.schema.text('Hello World.')))
          .content,
      )
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Hello World.</p>')
  })

  test('should emit updates', async ({ page }) => {
    let updateCount = 0
    const callback = () => {
      updateCount += 1
    }

    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.on('update', callback)
    }, undefined)
    // emit an update
    await setEditorContent(page, 'Hello World.', { emitUpdate: true })
    expect(updateCount).toBe(1)

    updateCount = 0
    // do not emit an update
    await setEditorContent(page, 'Hello World again.', { emitUpdate: false })
    expect(updateCount).toBe(0)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.off('update', callback)
    }, undefined)
  })

  test('should insert more complex html content', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setContent(
        '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
      )
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
    )
  })

  test('should remove newlines and tabs', async ({ page }) => {
    await setEditorContent(page, '<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Hello world how nice.</p>')
  })

  test('should keep newlines and tabs when preserveWhitespace = full', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>', {
        parseOptions: { preserveWhitespace: 'full' },
      })
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
  })

  test('should overwrite existing content', async ({ page }) => {
    await setEditorContent(page, '<p>Initial Content</p>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Initial Content</p>')

    await setEditorContent(page, '<p>Overwritten Content</p>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Overwritten Content</p>')

    await setEditorContent(page, 'Content without tags')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>Content without tags</p>')
  })

  test('should insert mentions', async ({ page }) => {
    await setEditorContent(page, '<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<span data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span>',
    )
  })

  test('should remove newlines and tabs between html fragments', async ({ page }) => {
    await setEditorContent(page, '<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello World</strong></p>',
    )
  })

  // TODO I'm not certain about this behavior and what it should do...
  // This exists in insertContentAt as well
  test('should keep newlines and tabs between html fragments when preserveWhitespace = full', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>', {
        parseOptions: { preserveWhitespace: 'full' },
      })
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p>\n\t</p><p><strong>Hello World</strong></p>',
    )
  })

  test('should allow inserting nothing', async ({ page }) => {
    await setEditorContent(page, '')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('')
  })

  test('should allow inserting nothing when preserveWhitespace = full', async ({ page }) => {
    await setEditorContent(page, '', { parseOptions: { preserveWhitespace: 'full' } })
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('')
  })

  test('should allow inserting a partial HTML tag', async ({ page }) => {
    await setEditorContent(page, '<p>foo')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>foo</p>')
  })

  test('should allow inserting a partial HTML tag when preserveWhitespace = full', async ({ page }) => {
    await setEditorContent(page, '<p>foo', { parseOptions: { preserveWhitespace: 'full' } })
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>foo</p>')
  })

  test('will remove an incomplete HTML tag', async ({ page }) => {
    await setEditorContent(page, 'foo<p')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>foo</p>')
  })

  // TODO I'm not certain about this behavior and what it should do...
  // This exists in insertContentAt as well
  test('should allow inserting an incomplete HTML tag when preserveWhitespace = full', async ({ page }) => {
    await setEditorContent(page, 'foo<p', { parseOptions: { preserveWhitespace: 'full' } })
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>foo&lt;p</p>')
  })

  test('should allow inserting a list', async ({ page }) => {
    await setEditorContent(page, '<ul><li>ABC</li><li>123</li></ul>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<ul><li><p>ABC</p></li><li><p>123</p></li></ul>',
    )
  })

  test('should allow inserting a list when preserveWhitespace = full', async ({ page }) => {
    await setEditorContent(page, '<ul><li>ABC</li><li>123</li></ul>', { parseOptions: { preserveWhitespace: 'full' } })
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<ul><li><p>ABC</p></li><li><p>123</p></li></ul>',
    )
  })

  test('should remove newlines and tabs when parseOptions.preserveWhitespace=false', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
        parseOptions: { preserveWhitespace: false },
      })
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello World</strong></p>',
    )
  })
})
