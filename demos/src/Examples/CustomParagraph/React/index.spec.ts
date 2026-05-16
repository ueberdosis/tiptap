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

test.describe('/src/Examples/CustomParagraph/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/CustomParagraph/React/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should have a paragraph and text length', async ({ page }) => {
    await expect(page.locator('.tiptap p')).toHaveCount(1)
    await expect(page.locator('.tiptap p')).toHaveText('Each line shows the number of characters in the paragraph.')
    await expect(page.locator('.tiptap .label')).toHaveCount(1)
    await expect(page.locator('.tiptap .label')).toHaveText('58')
  })

  test('should have new paragraph', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{moveToEnd}{enter}')
    await expect(page.locator('.tiptap p').nth(1)).toHaveCount(1)
    await expect(page.locator('.tiptap p').nth(1)).toHaveText('')
    await expect(page.locator('.tiptap .label').nth(1)).toHaveCount(1)
    await expect(page.locator('.tiptap .label').nth(1)).toHaveText('0')
  })
})
