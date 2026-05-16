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

test.describe('/src/Examples/CustomDocument/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/CustomDocument/React/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should have a headline and a paragraph', async ({ page }) => {
    await expect(page.locator('.tiptap h1')).toHaveCount(1)
    await expect(page.locator('.tiptap h1')).toHaveText('It’ll always have a heading …')
    await expect(page.locator('.tiptap p')).toHaveCount(1)
    await expect(page.locator('.tiptap p')).toHaveText(
      '… if you pass a custom document. That’s the beauty of having full control over the schema.',
    )
  })

  test('should have a tooltip for a paragraph on a new line', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')
    await expect(page.locator('.tiptap p[data-placeholder]')).toHaveCount(1)
    await expect(page.locator('.tiptap p[data-placeholder]')).toHaveAttribute(
      'data-placeholder',
      'Can you add some further context?',
    )
  })

  test('should have a headline after clearing the document', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
    await page.locator('.tiptap').first().focus()
    await expect(page.locator('.tiptap h1[data-placeholder]')).toHaveCount(1)
    await expect(page.locator('.tiptap h1[data-placeholder]')).toHaveAttribute('class', 'is-empty is-editor-empty')
    await expect(page.locator('.tiptap h1[data-placeholder]')).toHaveAttribute('data-placeholder', 'What’s the title?')
  })

  test('should have a headline after clearing the document & enter paragraph automatically after adding a headline', async ({
    page,
  }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}Hello world{enter}')
    await expect(page.locator('.tiptap h1')).toHaveCount(1)
    await expect(page.locator('.tiptap h1')).toHaveText('Hello world')
    await expect(page.locator('.tiptap p[data-placeholder]')).toHaveCount(1)
    await expect(page.locator('.tiptap p[data-placeholder]')).toHaveAttribute(
      'data-placeholder',
      'Can you add some further context?',
    )

    await page.locator('.tiptap').first().click()
    await typeText(page, 'This is a paragraph for this test document')
    await expect(page.locator('.tiptap p')).toHaveCount(1)
    await expect(page.locator('.tiptap p')).toHaveText('This is a paragraph for this test document')
  })
})
