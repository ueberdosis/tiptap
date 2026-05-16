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

test.describe('/src/Examples/EnterShortcuts/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/EnterShortcuts/Vue/')

    await setEditorContent(page, '<p>Example Text</p>')
  })

  test('should update the hint html when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { metaKey: true, key: 'Enter' })
    await expect(page.locator('.hint')).toContainText('Meta-Enter was the last shortcut')
  })

  test('should update the hint html when the keyboard shortcut is pressed (2)', async ({ page }) => {
    await pressShortcut(page, { shiftKey: true, key: 'Enter' })
    await expect(page.locator('.hint')).toContainText('Shift-Enter was the last shortcut')
  })

  test('should update the hint html when the keyboard shortcut is pressed (3)', async ({ page }) => {
    await pressShortcut(page, { ctrlKey: true, key: 'Enter' })
    await expect(page.locator('.hint')).toContainText('Ctrl-Enter was the last shortcut')
  })
})
