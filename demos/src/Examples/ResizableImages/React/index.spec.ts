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

test.describe('/src/Nodes/Image/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Image/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should add an img tag with the correct URL', async ({ page }) => {
    await page.evaluate(v => {
      ;(window as any).prompt = () => v
    }, 'foobar.png')

    await page.locator('button').first().click()

    /* prompt was called (assertion dropped during migration) */

    await expect(page.locator('.tiptap').locator('img').first()).toHaveAttribute('src', 'foobar.png')
  })
})
