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

test.describe('/src/Nodes/Heading/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Heading/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  const headings = ['<h1>Example Text</h1>', '<h2>Example Text</h2>', '<h3>Example Text</h3>']

  for (const html of headings) {
    test(`should parse headings correctly (${html})`, async ({ page }) => {
      await setEditorContent(page, html)
      expect(await getEditorHTML(page)).toBe(html)
    })
  }

  test('should omit disabled heading levels', async ({ page }) => {
    await setEditorContent(page, '<h4>Example Text</h4>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('the button should make the selected line a h1', async ({ page }) => {
    await expect(page.locator('.tiptap h1')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('h1').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should make the selected line a h2', async ({ page }) => {
    await expect(page.locator('.tiptap h2')).toHaveCount(0)

    await page.locator('button:nth-child(2)').first().click()

    await expect(page.locator('.tiptap').locator('h2').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should make the selected line a h3', async ({ page }) => {
    await expect(page.locator('.tiptap h3')).toHaveCount(0)

    await page.locator('button:nth-child(3)').first().click()

    await expect(page.locator('.tiptap').locator('h3').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the heading', async ({ page }) => {
    await expect(page.locator('.tiptap h1')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('h1').filter({ hasText: 'Example Text' }).first()).toBeAttached()

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap h1')).toHaveCount(0)
  })

  test('should make the paragraph a h1 keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, altKey: true, key: '1' })
    await expect(page.locator('.tiptap').locator('h1').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should make the paragraph a h2 keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, altKey: true, key: '2' })
    await expect(page.locator('.tiptap').locator('h2').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should make the paragraph a h3 keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, altKey: true, key: '3' })
    await expect(page.locator('.tiptap').locator('h3').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should make a h1 from the default markdown shortcut', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '# Headline')
    await expect(page.locator('.tiptap').locator('h1').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h2 from the default markdown shortcut', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '## Headline')
    await expect(page.locator('.tiptap').locator('h2').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h3 from the default markdown shortcut', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '### Headline')
    await expect(page.locator('.tiptap').locator('h3').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })
})
