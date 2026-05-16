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

test.describe('/src/Marks/Highlight/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Highlight/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.chain().setContent('<p>Example Text</p>').selectAll().run()
    }, undefined)
  })

  test('the button should highlight the selected text', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('mark')).toContainText('Example Text')
  })

  test('should highlight the text in a specific color', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.toggleHighlight({ color: 'red' })
    }, undefined)

    await expect(page.locator('.tiptap').locator('mark')).toContainText('Example Text')
    await expect(page.locator('.tiptap').locator('mark')).toHaveAttribute('data-color', 'red')
  })

  test('should update the attributes of existing marks', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor
        .chain()
        .setContent('<p><mark style="background-color: blue;">Example Text</mark></p>')
        .selectAll()
        .toggleHighlight({ color: 'rgb(255, 0, 0)' })
        .run()
    }, undefined)

    await expect(page.locator('.tiptap').locator('mark')).toHaveCSS('background-color', 'rgb(255, 0, 0)')
  })

  test('should remove existing marks with the same attributes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor
        .chain()
        .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
        .selectAll()
        .toggleHighlight({ color: 'rgb(255, 0, 0)' })
        .run()
    }, undefined)

    await expect(page.locator('.tiptap').locator('mark')).toHaveCount(0)
  })

  test('is active for mark with any attributes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.chain().setContent('<p><mark data-color="red">Example Text</mark></p>').selectAll().run()
    }, undefined)

    expect(await editorEval(page, "editor.isActive('highlight')", '.tiptap')).toBe(true)
  })

  test('is active for mark with same attributes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor
        .chain()
        .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
        .selectAll()
        .run()
    }, undefined)

    const isActive = await editorEval(page, "editor.isActive('highlight', { color: 'rgb(255, 0, 0)', })", '.tiptap')

    expect(isActive).toBe(true)
  })

  test('isn’t active for mark with other attributes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor
        .chain()
        .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
        .selectAll()
        .run()
    }, undefined)

    const isActive = await editorEval(page, "editor.isActive('highlight', { color: 'rgb(0, 0, 0)', })", '.tiptap')

    expect(isActive).toBe(false)
  })

  test('the button should toggle the selected text highlighted', async ({ page }) => {
    await page.locator('button').first().click()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('mark')).toHaveCount(0)
  })

  test('should highlight the selected text when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'h' })
    await expect(page.locator('.tiptap').locator('mark')).toContainText('Example Text')
  })

  test('should toggle the selected text highlighted when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'h' })
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'h' })
    await expect(page.locator('.tiptap').locator('mark')).toHaveCount(0)
  })
})
