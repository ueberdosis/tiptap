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

test.describe('/src/Nodes/HardBreak/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/HardBreak/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
  })

  test('should parse hard breaks correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example<br>Text</p>')
    expect(await getEditorHTML(page)).toBe('<p>Example<br>Text</p>')
  })

  test('should parse hard breaks with self-closing tag correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example<br />Text</p>')
    expect(await getEditorHTML(page)).toBe('<p>Example<br>Text</p>')
  })

  test('the button should add a line break', async ({ page }) => {
    await expect(page.locator('.tiptap br')).toHaveCount(0)

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap br')).toHaveCount(1)
  })

  test('the default keyboard shortcut should add a line break', async ({ page }) => {
    await expect(page.locator('.tiptap br')).toHaveCount(0)

    await pressShortcut(page, { shiftKey: true, key: 'Enter' })

    await expect(page.locator('.tiptap br')).toHaveCount(1)
  })

  test('the alternative keyboard shortcut should add a line break', async ({ page }) => {
    await expect(page.locator('.tiptap br')).toHaveCount(0)

    await pressShortcut(page, { modKey: true, key: 'Enter' })

    await expect(page.locator('.tiptap br')).toHaveCount(1)
  })
})
