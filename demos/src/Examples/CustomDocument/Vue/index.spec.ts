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

test.describe('/src/Examples/CustomDocument/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/CustomDocument/Vue/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should have a headline and a paragraph', async ({ page }) => {
    await expect(page.locator('.tiptap h1').first()).toBeAttached()
    await expect(page.locator('.tiptap h1').first()).toHaveText('It’ll always have a heading …')
    await expect(page.locator('.tiptap p').first()).toBeAttached()
    await expect(page.locator('.tiptap p').first()).toHaveText(
      '… if you pass a custom document. That’s the beauty of having full control over the schema.',
    )
  })

  test('should have a tooltip for a paragraph on a new line', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')
    await expect(page.locator('.tiptap p[data-placeholder]').first()).toBeAttached()
    await expect(page.locator('.tiptap p[data-placeholder]').first()).toHaveAttribute(
      'data-placeholder',
      'Can you add some further context?',
    )
  })

  test('should have a headline after clearing the document', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
    await page.waitForTimeout(100)
    await page.locator('.tiptap').first().focus()
    await expect(page.locator('.tiptap h1[data-placeholder]').first()).toBeAttached()
    await expect(page.locator('.tiptap h1[data-placeholder]').first()).toHaveAttribute(
      'class',
      'is-empty is-editor-empty',
    )
    await expect(page.locator('.tiptap h1[data-placeholder]').first()).toHaveAttribute(
      'data-placeholder',
      'What’s the title?',
    )
  })

  test('should have a headline after clearing the document & enter paragraph automatically after adding a headline', async ({
    page,
  }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}Hello world{enter}')
    await page.waitForTimeout(100)
    await expect(page.locator('.tiptap h1').first()).toBeAttached()
    await expect(page.locator('.tiptap h1').first()).toHaveText('Hello world')
    await expect(page.locator('.tiptap p[data-placeholder]').first()).toBeAttached()
    await expect(page.locator('.tiptap p[data-placeholder]').first()).toHaveAttribute(
      'data-placeholder',
      'Can you add some further context?',
    )

    await page.locator('.tiptap').first().click()
    await typeText(page, 'This is a paragraph for this test document')
    await expect(page.locator('.tiptap p').first()).toBeAttached()
    await expect(page.locator('.tiptap p').first()).toHaveText('This is a paragraph for this test document')
  })
})
