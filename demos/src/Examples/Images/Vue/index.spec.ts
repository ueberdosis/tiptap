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

test.describe('/src/Examples/Images/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Images/Vue/')
  })

  // TODO: Write tests
  test('finds image elements inside editor', async ({ page }) => {
    await expect(page.locator('.tiptap img')).toHaveCount(2)
  })

  test('allows removing images', async ({ page }) => {
    await expect(page.locator('.tiptap').first()).toBeVisible()
    await expect(page.locator('.tiptap img')).toHaveCount(2)
    await expect(page.locator('.tiptap img').first()).toBeVisible()
    const naturalWidth = await page
      .locator('.tiptap img')
      .first()
      .evaluate(img => (img as HTMLImageElement).naturalWidth)
    expect(naturalWidth).toBeGreaterThan(0)
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
