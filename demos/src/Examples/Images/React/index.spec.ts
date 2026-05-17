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

test.describe('/src/Examples/Images/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Images/React/')
  })

  test('finds image elements inside editor', async ({ page }) => {
    await expect(page.locator('.tiptap img')).toHaveCount(2)
  })

  test('allows removing images', async ({ page }) => {
    await expect(page.locator('.tiptap').first()).toBeVisible()
    await expect(page.locator('.tiptap img')).toHaveCount(2)
    await expect(page.locator('.tiptap img').first()).toBeVisible()
    await page.locator('.tiptap img').first().click()
    await expect(page.locator('.tiptap img.ProseMirror-selectednode').first()).toBeAttached()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{backspace}')
    await expect(page.locator('.tiptap img')).toHaveCount(1)
  })

  test('allows images to be added via URL', async ({ page }) => {
    await page.evaluate(v => {
      ;(window as any).prompt = () => v
    }, 'https://placehold.co/400x400')

    await page.waitForTimeout(1000)
    await page.locator('button').filter({ hasText: 'Add image from URL' }).first().click()
    await page.waitForTimeout(1000)
    await expect(page.locator('.tiptap img')).toHaveCount(3)
  })
})
