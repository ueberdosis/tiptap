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

test.describe('/src/Examples/Tasks/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Tasks/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should always use task items', async ({ page }) => {
    await expect(page.locator('.tiptap input[type="checkbox"]')).toHaveCount(1)
  })

  test('should create new tasks', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Cook food{enter}Eat food{enter}Clean dishes')
    await expect(page.locator('.tiptap input[type="checkbox"]')).toHaveCount(3)
  })

  test('should check and uncheck tasks on click', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Cook food{enter}Eat food{enter}Clean dishes')
    await page.locator('.tiptap').locator('input[type="checkbox"]').nth(0).click({ force: true })
    await expect(page.locator('.tiptap').locator('input[type="checkbox"]:checked')).toHaveCount(1)
    await page.locator('.tiptap').locator('input[type="checkbox"]').nth(1).click({ force: true })
    await expect(page.locator('.tiptap').locator('input[type="checkbox"]:checked')).toHaveCount(2)
    await page.locator('.tiptap').locator('input[type="checkbox"]').nth(0).click({ force: true })
    await expect(page.locator('.tiptap').locator('input[type="checkbox"]:checked')).toHaveCount(1)
    await page.locator('.tiptap').locator('input[type="checkbox"]').nth(1).click({ force: true })
    await expect(page.locator('.tiptap').locator('input[type="checkbox"]:checked')).toHaveCount(0)
  })
})
