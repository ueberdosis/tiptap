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

test.describe('/src/Commands/InsertContent/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Commands/InsertContent/React/')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
  })

  test('should insert html content correctly', async ({ page }) => {
    await page.locator('button[data-test-id="html-content"]').first().click()

    // check if the content html is correct
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1><a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a></h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>',
    )
  })

  test('should keep spaces inbetween tags in html content', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<p><b>Hello</b> <i>World</i></p>')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p><strong>Hello</strong> <em>World</em></p>')
  })

  test('should keep empty spaces', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent(' ')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p> </p>')
  })

  test('should insert text content correctly', async ({ page }) => {
    await page.locator('button[data-test-id="text-content"]').first().click()

    // check if the content html is correct
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly',
    )
  })

  test('should keep newlines in pre tag', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<pre><code>foo\nbar</code></pre>')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<pre><code>foo\nbar</code></pre>')
  })

  test('should keep newlines and tabs', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>',
    )
  })

  test('should keep newlines and tabs (2)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<h1>Tiptap</h1>\n<p><strong>Hello World</strong></p>')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello World</strong></p>',
    )
  })

  test('should allow inserting nothing', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('')
  })

  test('should allow inserting a partial HTML tag', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<p>foo')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>foo</p>')
  })

  test('should allow inserting an incomplete HTML tag', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('foo<p')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p>foo&lt;p</p>')
  })

  test('should allow inserting a list', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<ul><li>ABC</li><li>123</li></ul>')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<ul><li><p>ABC</p></li><li><p>123</p></li></ul>',
    )
  })

  test('should remove newlines and tabs when parseOptions.preserveWhitespace=false', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
        parseOptions: { preserveWhitespace: false },
      })
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello World</strong></p>',
    )
  })

  test('should split content when image is inserted inbetween text', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<p>HelloWorld</p>')
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setTextSelection(6)
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<p>Hello</p><img src="https://example.image/1" alt="This is an example" contenteditable="false" draggable="true"><p>World</p>',
    )
  })

  test('should not split content when image is inserted at beginning of text', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<p>HelloWorld</p>')
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setTextSelection(1)
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<img src="https://example.image/1" alt="This is an example" contenteditable="false" draggable="true"><p>HelloWorld</p>',
    )
  })
  test('should respect editor.options.parseOptions if defined to be `false`', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.options.parseOptions = { preserveWhitespace: false }
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello World</strong></p>',
    )
  })

  test('should respect editor.options.parseOptions if defined to be `full`', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.options.parseOptions = { preserveWhitespace: 'full' }
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello\n World</strong></p>',
    )
  })

  test('should respect editor.options.parseOptions if defined to be `true`', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.options.parseOptions = { preserveWhitespace: true }
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>')
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<h1>Tiptap</h1><p><strong>Hello World</strong></p>',
    )
  })
})
