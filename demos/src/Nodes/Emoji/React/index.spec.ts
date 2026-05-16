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

test.describe('/src/Nodes/Emoji/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Emoji/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p></p>')

    await page.locator('.tiptap').first().click()
  })

  test('insert :smile: via typing', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, ':smile:')
    // after typing the shortcode the emoji should be rendered as a node
    await expect(page.locator('.tiptap').locator('[data-type="emoji"][data-name="smile"]')).toHaveCount(1)
  })

  test('insert button inserts an emoji node', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Insert ⚡' }).first().click()
    await expect(page.locator('.tiptap').locator('[data-type="emoji"][data-name="zap"]')).toHaveCount(1)
  })

  test('pasting a URL containing :x: does not convert the shortcode', async ({ page }) => {
    const url = 'https://example-url.com/:x:/sub'
    await pasteIntoEditor(page, { paste: url })

    page.locator('.tiptap').filter({ hasText: url })
    await expect(page.locator('.tiptap').locator('[data-type="emoji"]')).toHaveCount(0)
  })

  test('pasting a standalone shortcode converts to an emoji node', async ({ page }) => {
    await pasteIntoEditor(page, { paste: ':smile:' })
    await expect(page.locator('.tiptap').locator('[data-type="emoji"]')).toHaveCount(1)
  })
})
