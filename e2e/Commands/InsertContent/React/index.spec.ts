import test from '@playwright/test'

import { getEditorHTML, runEditor, TIPTAP_SELECTOR } from '../../../helpers.js'

test.describe('React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/src/Commands/InsertContent/React/')
    await page.waitForSelector(TIPTAP_SELECTOR)
  })

  test('should insert html content correctly', async ({ page }) => {
    await page.locator('button[data-test-id="html-content"]').click()
    const htmlContent = await getEditorHTML(page)
    await test
      .expect(htmlContent)
      .toContain(
        '<h1><a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a></h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>',
      )
  })

  test('should keep spaces inbetween tags in html content', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<p><b>Hello</b> <i>World</i></p>')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<p><strong>Hello</strong> <em>World</em></p>')
  })

  test('should keep empty spaces', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('  ')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<p>  </p>')
  })

  test('should insert text content correctly', async ({ page }) => {
    await page.locator('button[data-test-id="text-content"]').click()
    const htmlContent = await getEditorHTML(page)
    await test
      .expect(htmlContent)
      .toContain(
        'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly',
      )
  })

  test('should keep newlines in pre tag', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<pre><code>foo\nbar</code></pre>')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<pre><code>foo\nbar</code></pre>')
  })

  test('should keep newlines and tabs', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
  })

  test('should not keep newline between nodes', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<h1>Tiptap</h1>\n<p><strong>Hello World</strong></p>')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  test('should allow inserting nothing', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('')
  })

  test('should allow inserting a partial HTML tag', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<p>foo')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<p>foo</p>')
  })

  test('should allow inserting an incomplete HTML tag', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('foo<p')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<p>foo&lt;p</p>')
  })

  test('should allow inserting a list', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<ul><li>Item 1</li><li>Item 2</li></ul>')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>')
  })

  test('should remove newlines and tabs when parseOptions.preserveWhitespace=false', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
        parseOptions: { preserveWhitespace: false },
      })
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  test('should split content when image is inserted inbetween text', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<p>HelloWorld</p>')
      editor.commands.setTextSelection(6)
      editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')
    })
    const html = await getEditorHTML(page)
    await test
      .expect(html)
      .toContain(
        '<p>Hello</p><img src="https://example.image/1" alt="This is an example" contenteditable="false" draggable="true"><p>World</p>',
      )
  })

  test('should not split content when image is inserted at beginning of text', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('<p>HelloWorld</p>')
      editor.commands.setTextSelection(1)
      editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')
    })
    const html = await getEditorHTML(page)
    await test
      .expect(html)
      .toContain(
        '<img src="https://example.image/1" alt="This is an example" contenteditable="false" draggable="true"><p>HelloWorld</p>',
      )
  })

  test('should respect editor.options.preserveWhitespace if defined to be `false`', async ({ page }) => {
    await runEditor(page, editor => {
      editor.options.parseOptions = { preserveWhitespace: false }
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  test('should respect editor.options.preserveWhitespace if defined to be `full`', async ({ page }) => {
    await runEditor(page, editor => {
      editor.options.parseOptions = { preserveWhitespace: 'full' }
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello\n World</strong></p>')
  })

  test('should respect editor.options.preserveWhitespace if defined to be `true`', async ({ page }) => {
    await runEditor(page, editor => {
      editor.options.parseOptions = { preserveWhitespace: true }
      editor.commands.insertContent('<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>')
    })
    const html = await getEditorHTML(page)
    await test.expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello  World</strong></p>')
  })
})
