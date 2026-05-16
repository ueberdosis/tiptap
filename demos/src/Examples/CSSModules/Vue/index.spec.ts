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

test.describe('/src/Examples/CSSModules/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/CSSModules/Vue/')
  })

  test('should apply a randomly generated class that adds padding and background color to the toolbar', async ({
    page,
  }) => {
    await expect(page.locator('.toolbar').first()).toBeAttached()
    await expect(page.locator('.toolbar').first()).toHaveCSS('background-color', 'rgb(255, 0, 0)')
    await expect(page.locator('.toolbar').first()).toHaveCSS('padding', '16px')
  })
})
