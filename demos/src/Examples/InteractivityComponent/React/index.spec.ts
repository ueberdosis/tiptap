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

test.describe('/src/Examples/InteractivityComponent/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/InteractivityComponent/React/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should render a custom node', async ({ page }) => {
    await expect(page.locator('.tiptap .react-component')).toHaveCount(1)
  })

  test('should handle count click inside custom node', async ({ page }) => {
    await expect(page.locator('.tiptap .react-component button')).toHaveText('This button has been clicked 0 times.')
    await page.locator('.tiptap .react-component button').first().click()
    await expect(page.locator('.tiptap .react-component button')).toHaveText('This button has been clicked 1 times.')
    await page.locator('.tiptap .react-component button').first().click()
    await expect(page.locator('.tiptap .react-component button')).toHaveText('This button has been clicked 2 times.')
    await page.locator('.tiptap .react-component button').first().click()
    await expect(page.locator('.tiptap .react-component button')).toHaveText('This button has been clicked 3 times.')
  })
})
