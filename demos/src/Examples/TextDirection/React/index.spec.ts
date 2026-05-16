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

test.describe('/src/Examples/TextDirection/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/TextDirection/React/')
  })

  test('should apply text direction attributes', async ({ page }) => {
    await expect(page.locator('.tiptap p').first()).toHaveAttribute('dir', 'auto')
  })

  test('should change global direction', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'RTL' }).first().click()
    await expect(page.locator('.tiptap p').first()).toHaveAttribute('dir', 'rtl')
  })

  test('should set direction on selection', async ({ page }) => {
    await page.locator('.tiptap p').first().click()
    await page.locator('button').filter({ hasText: 'Set LTR' }).first().click()
    await expect(page.locator('.tiptap p').first()).toHaveAttribute('dir', 'ltr')
  })

  test('should unset direction', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'None' }).first().click()
    await expect(page.locator('.tiptap p').first()).not.toHaveAttribute('dir', /.*/)
  })
})
