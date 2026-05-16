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

test.describe('/src/Extensions/UndoRedo/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/UndoRedo/Vue/')

    await setEditorContent(page, '<p>Mistake</p>')
  })

  test('should make the last change undone', async ({ page }) => {
    await expect(page.locator('.tiptap')).toContainText('Mistake')

    await expect(page.locator('button').first()).not.toHaveAttribute('disabled', /.*/)

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').first()).not.toContainText('Mistake')
  })

  test('should make the last change undone with the keyboard shortcut', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'z' })

    await expect(page.locator('.tiptap').first()).not.toContainText('Mistake')
  })

  test('should make the last change undone with the keyboard shortcut (russian)', async ({ page }) => {
    await expect(page.locator('.tiptap')).toContainText('Mistake')

    await pressShortcut(page, { modKey: true, key: 'я' })

    await expect(page.locator('.tiptap').first()).not.toContainText('Mistake')
  })

  test('should apply the last undone change again with the keyboard shortcut', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'z' })

    await expect(page.locator('.tiptap').first()).not.toContainText('Mistake')

    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'z' })

    await expect(page.locator('.tiptap')).toContainText('Mistake')
  })

  test('should apply the last undone change again with the keyboard shortcut (russian)', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'я' })

    await expect(page.locator('.tiptap').first()).not.toContainText('Mistake')

    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'я' })

    await expect(page.locator('.tiptap')).toContainText('Mistake')
  })

  test('should apply the last undone change again', async ({ page }) => {
    await expect(page.locator('.tiptap')).toContainText('Mistake')

    await expect(page.locator('button').first()).not.toHaveAttribute('disabled', /.*/)

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').first()).not.toContainText('Mistake')

    await expect(page.locator('button').first()).toHaveAttribute('disabled', /.*/)

    await page.locator('button:nth-child(2)').first().click()

    await expect(page.locator('.tiptap')).toContainText('Mistake')
  })

  test('should disable undo button when there are no more changes to undo', async ({ page }) => {
    await expect(page.locator('.tiptap')).toContainText('Mistake')

    await expect(page.locator('button').first()).not.toHaveAttribute('disabled', /.*/)

    await page.locator('button').first().click()

    await expect(page.locator('button').first()).toHaveAttribute('disabled', /.*/)
  })

  test('should disable redo button when there are no more changes to redo', async ({ page }) => {
    await expect(page.locator('.tiptap')).toContainText('Mistake')

    await expect(page.locator('button:nth-child(2)')).toHaveAttribute('disabled', /.*/)

    await expect(page.locator('button').first()).not.toHaveAttribute('disabled', /.*/)

    await page.locator('button').first().click()

    await expect(page.locator('button:nth-child(2)')).not.toHaveAttribute('disabled', /.*/)
  })
})
